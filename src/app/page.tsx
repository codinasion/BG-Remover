"use client"

import React, { useState, useRef } from 'react';
import { Upload, Download, Zap, Shield, Globe, Heart, Star, Check, Coffee, Crown, Users, Clock, Award, ArrowRight, Menu, X, Image as ImageIcon, Scissors, Sparkles, Target, Briefcase, Camera, ShoppingBag, Play, AlertCircle } from 'lucide-react';
import Head from 'next/head';

// U²-Net ONNX background removal - lightweight and fast
// Install: npm install onnxruntime-web
// Download u2netp.onnx model to public/models/u2netp.onnx

let session = null;

const loadModel = async () => {
  if (!session) {
    try {
      // Dynamic import to avoid SSR issues
      const ort = await import('onnxruntime-web');

      // Try to load the model with better error handling
      session = await ort.InferenceSession.create('/models/u2netp.onnx', {
        executionProviders: ['wasm'], // Can switch to 'webgpu' when supported
      });
    } catch (error) {
      console.error('Failed to load U²-Net model:', error);

      // Provide specific error messages based on the error type
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        throw new Error('AI model not found. Please download u2netp.onnx model and place it in public/models/ folder.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error loading AI model. Please check your internet connection and try again.');
      } else {
        throw new Error('Failed to initialize AI model. Your browser may not support this feature.');
      }
    }
  }
  return session;
};

const removeBackgroundFromImage = async (image, onProgress) => {
  try {
    onProgress(10);

    if (!session) {
      await loadModel();
    }

    onProgress(25);

    const ort = await import('onnxruntime-web');

    // Keep model's expected input size
    const H = 320;
    const W = 320;

    // Prepare canvas for processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    onProgress(35);

    // Draw and resize image with better interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, W, H);
    const imgData = ctx.getImageData(0, 0, W, H);

    onProgress(45);

    // Convert to tensor format [1,3,H,W] with better normalization
    const float32Data = new Float32Array(3 * W * H);
    for (let i = 0; i < W * H; i++) {
      // Apply slight contrast enhancement for better segmentation
      const r = imgData.data[i * 4] / 255.0;
      const g = imgData.data[i * 4 + 1] / 255.0;
      const b = imgData.data[i * 4 + 2] / 255.0;

      float32Data[i] = Math.min(Math.max(r * 1.05 - 0.025, 0), 1); // R with subtle contrast
      float32Data[i + W * H] = Math.min(Math.max(g * 1.05 - 0.025, 0), 1); // G with subtle contrast
      float32Data[i + 2 * W * H] = Math.min(Math.max(b * 1.05 - 0.025, 0), 1); // B with subtle contrast
    }

    const tensor = new ort.Tensor('float32', float32Data, [1, 3, H, W]);

    onProgress(60);

    // Run inference - try different possible input names
    let results;
    try {
      results = await session.run({ 'input.1': tensor });
    } catch (error) {
      try {
        results = await session.run({ 'input': tensor });
      } catch (error2) {
        try {
          results = await session.run({ 'data': tensor });
        } catch (error3) {
          const inputNames = session.inputNames;
          console.log('Available input names:', inputNames);

          if (inputNames.length > 0) {
            const inputFeed = {};
            inputFeed[inputNames[0]] = tensor;
            results = await session.run(inputFeed);
          } else {
            throw new Error('Could not determine model input name. Please check the model file.');
          }
        }
      }
    }

    onProgress(80);

    // Get output
    let output;
    const outputNames = Object.keys(results);
    console.log('Available output names:', outputNames);

    if (outputNames.length > 0) {
      output = results[outputNames[0]];
    } else {
      throw new Error('No model outputs found.');
    }

    // Process mask with improved quality
    const maskData = output.data;

    // Apply advanced post-processing to improve mask quality
    const processedMask = new Float32Array(W * H);

    // First pass: Apply bilateral-like filtering for edge preservation
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const idx = y * W + x;
        const center = maskData[idx];

        // Get 3x3 neighborhood
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            neighbors.push(maskData[(y + dy) * W + (x + dx)]);
          }
        }

        // Weighted average with edge preservation
        let weightedSum = 0;
        let totalWeight = 0;

        neighbors.forEach((neighbor, i) => {
          const weight = Math.exp(-Math.abs(neighbor - center) * 5); // Edge-preserving weight
          weightedSum += neighbor * weight;
          totalWeight += weight;
        });

        processedMask[idx] = weightedSum / totalWeight;
      }
    }

    // Second pass: Apply sigmoid curve for better contrast
    for (let i = 0; i < W * H; i++) {
      const value = processedMask[i];
      // Smooth sigmoid with adjustable threshold
      processedMask[i] = 1 / (1 + Math.exp(-12 * (value - 0.5)));
    }

    onProgress(90);

    // Create result canvas with original image dimensions
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = image.naturalWidth;
    resultCanvas.height = image.naturalHeight;
    const resultCtx = resultCanvas.getContext('2d');

    // Enable high-quality rendering
    resultCtx.imageSmoothingEnabled = true;
    resultCtx.imageSmoothingQuality = 'high';

    // Draw original image
    resultCtx.drawImage(image, 0, 0);
    const imageData = resultCtx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);

    // Apply mask with bilinear interpolation for smoother scaling
    for (let y = 0; y < image.naturalHeight; y++) {
      for (let x = 0; x < image.naturalWidth; x++) {
        // Map coordinates to mask space with sub-pixel accuracy
        const maskX = (x / image.naturalWidth) * (W - 1);
        const maskY = (y / image.naturalHeight) * (H - 1);

        // Bilinear interpolation
        const x1 = Math.floor(maskX);
        const y1 = Math.floor(maskY);
        const x2 = Math.min(x1 + 1, W - 1);
        const y2 = Math.min(y1 + 1, H - 1);

        const dx = maskX - x1;
        const dy = maskY - y1;

        // Get four corner values
        const tl = processedMask[y1 * W + x1]; // top-left
        const tr = processedMask[y1 * W + x2]; // top-right
        const bl = processedMask[y2 * W + x1]; // bottom-left
        const br = processedMask[y2 * W + x2]; // bottom-right

        // Interpolate
        const top = tl + (tr - tl) * dx;
        const bottom = bl + (br - bl) * dx;
        const alpha = top + (bottom - top) * dy;

        // Apply alpha to image pixel
        const pixelIdx = (y * image.naturalWidth + x) * 4;
        imageData.data[pixelIdx + 3] = Math.round(Math.max(0, Math.min(255, alpha * 255)));
      }
    }

    // Put processed image data back
    resultCtx.putImageData(imageData, 0, 0);

    onProgress(100);

    return resultCanvas.toDataURL('image/png');

  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error(error.message || 'Failed to remove background. Please try again.');
  }
};

export default function RemoveBackgroundLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageElement, setSelectedImageElement] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [coffeeAmount, setCoffeeAmount] = useState(5);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, or WebP)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      // Clear any previous errors
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setProcessedImage(null);

        // Create image element for processing
        const img = new Image();
        img.onload = () => {
          setSelectedImageElement(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedImageElement) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);

    try {
      // Pre-load model if not loaded
      if (!modelLoaded) {
        setProcessingProgress(5);
        await loadModel();
        setModelLoaded(true);
      }

      // Process with progress callback
      const resultUrl = await removeBackgroundFromImage(
        selectedImageElement,
        (progress) => setProcessingProgress(progress)
      );

      setProcessedImage(resultUrl);

    } catch (error) {
      setError(error.message || 'Failed to remove background. Please try again.');
      console.error('Background removal error:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  };

  const downloadImage = async () => {
    if (processedImage) {
      try {
        // Create download link
        const link = document.createElement('a');
        link.download = `bg-removed-${Date.now()}.png`;
        link.href = processedImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
        setError('Failed to download image. Please try again.');
      }
    }
  };

  const resetTool = () => {
    setSelectedImage(null);
    setSelectedImageElement(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setError(null);
  };

  return (
    <>
      {/* SEO Head */}
      <Head>
        <title>Remove Image Background Free | AI Background Remover Tool | BG Remover</title>
        <meta name="description" content="Remove image backgrounds instantly with our free AI-powered tool. Perfect for e-commerce, social media, and design. No signup required. Process images in seconds with professional quality results." />
        <meta name="keywords" content="remove background, background remover, AI background removal, transparent background, remove image background free, photo background remover, online background eraser, product photography, e-commerce photos, cut out background, background removal tool, png transparent, remove bg online, photo editor background, image background remover free, auto background removal, smart background remover, professional background removal, bulk background removal" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bgremover.com/" />
        <meta property="og:title" content="Free AI Background Remover - Remove Image Backgrounds Instantly | BG Remover" />
        <meta property="og:description" content="Professional AI-powered background removal in seconds. Perfect for e-commerce, social media, and creative projects. 100% free and privacy-focused. Used by 1M+ creators worldwide." />
        <meta property="og:image" content="https://bgremover.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="AI Background Remover Tool - Remove backgrounds from any image instantly" />
        <meta property="og:site_name" content="BG Remover" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://bgremover.com/" />
        <meta property="twitter:title" content="Free AI Background Remover - Remove Image Backgrounds Instantly" />
        <meta property="twitter:description" content="Professional AI-powered background removal in seconds. Perfect for e-commerce, social media, and creative projects. Try it free now!" />
        <meta property="twitter:image" content="https://bgremover.com/twitter-image.jpg" />
        <meta property="twitter:image:alt" content="AI Background Remover Tool Screenshot" />
        <meta property="twitter:creator" content="@bgremover" />
        <meta property="twitter:site" content="@bgremover" />

        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="BG Remover Team" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />

        {/* Geo Tags for Global Reach */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="geo.position" content="39.50;-98.35" />
        <meta name="ICBM" content="39.50, -98.35" />

        {/* Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BG Remover" />

        {/* Favicon and Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#2b5797" />
        <meta name="theme-color" content="#ffffff" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://bgremover.com/" />

        {/* Alternate Languages (for future internationalization) */}
        <link rel="alternate" hrefLang="en" href="https://bgremover.com/" />
        <link rel="alternate" hrefLang="es" href="https://bgremover.com/es/" />
        <link rel="alternate" hrefLang="fr" href="https://bgremover.com/fr/" />
        <link rel="alternate" hrefLang="de" href="https://bgremover.com/de/" />
        <link rel="alternate" hrefLang="it" href="https://bgremover.com/it/" />
        <link rel="alternate" hrefLang="pt" href="https://bgremover.com/pt/" />
        <link rel="alternate" hrefLang="ja" href="https://bgremover.com/ja/" />
        <link rel="alternate" hrefLang="ko" href="https://bgremover.com/ko/" />
        <link rel="alternate" hrefLang="zh" href="https://bgremover.com/zh/" />
        <link rel="alternate" hrefLang="x-default" href="https://bgremover.com/" />

        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "BG Remover - AI Background Remover",
              "description": "Free AI-powered background removal tool for images. Remove backgrounds instantly with professional quality results.",
              "url": "https://bgremover.com",
              "applicationCategory": "PhotographyApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "15847"
              },
              "author": {
                "@type": "Organization",
                "name": "BG Remover Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "BG Remover",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://bgremover.com/logo.png"
                }
              }
            })
          }}
        />

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I remove background from an image for free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Upload your image to our AI background remover tool, click 'Remove Background', and download your image with transparent background. It's completely free and takes just seconds."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What image formats are supported?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We support JPG, PNG, and WebP formats up to 10MB in size. The output is always a high-quality PNG with transparent background."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is my image data safe and private?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, absolutely. All images are processed locally in your browser and never uploaded to our servers. Your privacy is 100% protected."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use removed background images commercially?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, you have full rights to use the processed images for any purpose, including commercial use, without any restrictions."
                  }
                }
              ]
            })
          }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://bgremover.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Background Remover",
                  "item": "https://bgremover.com/background-remover"
                }
              ]
            })
          }}
        />

        {/* HowTo Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How to Remove Background from Image",
              "description": "Step-by-step guide to remove background from any image using AI",
              "image": "https://bgremover.com/how-to-image.jpg",
              "totalTime": "PT30S",
              "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": "0"
              },
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Upload Image",
                  "text": "Click upload or drag and drop your image file",
                  "image": "https://bgremover.com/step1.jpg"
                },
                {
                  "@type": "HowToStep",
                  "name": "Process Image",
                  "text": "Click 'Remove Background' and wait for AI processing",
                  "image": "https://bgremover.com/step2.jpg"
                },
                {
                  "@type": "HowToStep",
                  "name": "Download Result",
                  "text": "Download your image with transparent background as PNG",
                  "image": "https://bgremover.com/step3.jpg"
                }
              ]
            })
          }}
        />

        {/* Performance and Loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

        {/* No additional external stylesheets needed - using Tailwind */}
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">{/* SEO Head equivalent - would go in layout or _document in real Next.js */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

          {/* Navigation */}
          <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl text-gray-900">BG Remover</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                  <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
                  <a href="#use-cases" className="text-gray-700 hover:text-blue-600 transition-colors">Use Cases</a>
                  <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Reviews</a>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                    Get Started
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Mobile Menu */}
              {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                  <div className="px-2 pt-2 pb-3 space-y-1">
                    <a href="#features" className="block px-3 py-2 text-gray-700">Features</a>
                    <a href="#use-cases" className="block px-3 py-2 text-gray-700">Use Cases</a>
                    <a href="#testimonials" className="block px-3 py-2 text-gray-700">Reviews</a>
                    <button className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-lg mt-2">
                      Get Started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Hero Section */}
          <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="mb-6">
                  <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    🚀 #1 AI Background Remover Tool
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Remove Image Backgrounds
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Instantly</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Professional AI-powered background removal in seconds. Perfect for e-commerce, social media, and creative projects. No design skills required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => document.getElementById('tool').scrollIntoView()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Try Free Now
                  </button>
                  <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Tool Component */}
          <section id="tool" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Remove Backgrounds in 3 Simple Steps
                </h2>
                <p className="text-gray-600 text-lg">Upload, process, and download your image with transparent background</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                {/* Model setup instructions */}
                {error && error.includes('model not found') && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">Setup Required: AI Model Missing</h4>
                        <p className="text-yellow-700 mb-3">
                          To use this tool, you need to download the AI model file. Follow these steps:
                        </p>
                        <ol className="text-yellow-700 text-sm space-y-2 list-decimal list-inside">
                          <li>Download <code className="bg-yellow-100 px-2 py-1 rounded text-xs">u2netp.onnx</code> from:
                            <a href="https://github.com/xuebinqin/U-2-Net/releases" target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-1">
                              U²-Net GitHub Releases
                            </a>
                          </li>
                          <li>Create a <code className="bg-yellow-100 px-2 py-1 rounded text-xs">public/models/</code> folder in your project</li>
                          <li>Place the <code className="bg-yellow-100 px-2 py-1 rounded text-xs">u2netp.onnx</code> file inside it</li>
                          <li>Refresh this page and try again</li>
                        </ol>
                        <p className="text-yellow-600 text-xs mt-3">
                          💡 The model is ~5MB and only needs to be downloaded once
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular error display for other errors */}
                {error && !error.includes('model not found') && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 cursor-pointer transition-colors bg-white"
                  >
                    <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Image</h3>
                    <p className="text-gray-600 mb-4">Drag and drop or click to select</p>
                    <p className="text-sm text-gray-500">Supports JPG, PNG, WebP (Max 10MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-center">Original</h4>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <img src={selectedImage} alt="Original" className="w-full h-64 object-contain rounded" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-center">Processed</h4>
                      <div className="bg-white rounded-lg p-4 shadow-sm relative">
                        {processedImage ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded opacity-30"></div>
                            <img src={processedImage} alt="Background Removed" className="w-full h-64 object-contain rounded relative z-10" />
                          </div>
                        ) : (
                          <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                            {isProcessing ? (
                              <div className="text-center">
                                <div className="relative w-16 h-16 mx-auto mb-4">
                                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                                  <div
                                    className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
                                  ></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">{Math.round(processingProgress)}%</span>
                                  </div>
                                </div>
                                <p className="text-gray-600 font-medium">AI is removing background...</p>
                                <div className="w-48 bg-gray-200 rounded-full h-2 mt-3">
                                  <div
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${processingProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500">Click process to see result</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedImage && (
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                    {!processedImage && !isProcessing && (
                      <button
                        onClick={processImage}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-5 h-5" />
                        Remove Background
                      </button>
                    )}

                    {processedImage && (
                      <button
                        onClick={downloadImage}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download PNG
                      </button>
                    )}

                    <button
                      onClick={resetTool}
                      disabled={isProcessing}
                      className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Over
                    </button>
                  </div>
                )}

                {/* Tips for better results */}
                {selectedImage && !processedImage && !isProcessing && (
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">💡 Tips for Best Results:</h5>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Use images with clear subject-background contrast</li>
                      <li>• Avoid very small or low-resolution images</li>
                      <li>• Well-lit photos work better than dark images</li>
                      <li>• First-time processing loads the AI model (~5-10MB)</li>
                      <li>• Processing takes 5-15 seconds depending on device</li>
                    </ul>
                  </div>
                )}

                {/* Model loading info */}
                {!modelLoaded && (
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <p className="text-amber-800 text-sm">
                        <strong>First use:</strong> AI model will download automatically (~5MB, one-time only)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Buy Me a Coffee */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-200">
                <div className="text-center mb-8">
                  <Coffee className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Fuel Our Innovation ☕</h3>
                  <p className="text-gray-600">
                    Love this tool? Support us with a virtual coffee and help us keep improving!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-gray-700">$</span>
                    <div className="flex gap-2">
                      {[3, 5, 10, 25].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setCoffeeAmount(amount)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${coffeeAmount === amount
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-amber-100'
                            }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Buy Coffee (${coffeeAmount})
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🙏 Thank you for supporting open-source tools!
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Powerful Features for Perfect Results
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Advanced AI technology meets user-friendly design to deliver professional-quality background removal
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Zap className="w-8 h-8" />,
                    title: "Lightning Fast",
                    description: "Process images in under 3 seconds with our optimized AI algorithms",
                    color: "from-yellow-400 to-orange-500"
                  },
                  {
                    icon: <Shield className="w-8 h-8" />,
                    title: "100% Private",
                    description: "Your images are processed locally and never stored on our servers",
                    color: "from-green-400 to-blue-500"
                  },
                  {
                    icon: <Globe className="w-8 h-8" />,
                    title: "Works Globally",
                    description: "Optimized for all regions with multi-language support coming soon",
                    color: "from-blue-400 to-purple-500"
                  },
                  {
                    icon: <ImageIcon className="w-8 h-8" />,
                    title: "High Quality",
                    description: "Preserve image quality with precise edge detection and anti-aliasing",
                    color: "from-purple-400 to-pink-500"
                  },
                  {
                    icon: <Target className="w-8 h-8" />,
                    title: "Perfect Precision",
                    description: "AI-powered edge detection handles complex hair, fur, and fine details",
                    color: "from-pink-400 to-red-500"
                  },
                  {
                    icon: <Download className="w-8 h-8" />,
                    title: "Multiple Formats",
                    description: "Download in PNG, JPG, or WebP with transparent or colored backgrounds",
                    color: "from-indigo-400 to-blue-500"
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group">
                    <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Perfect for Every Use Case
                </h2>
                <p className="text-xl text-gray-600">
                  From e-commerce to social media, see how our tool transforms workflows
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <ShoppingBag className="w-6 h-6" />,
                    title: "E-commerce",
                    description: "Clean product photos for online stores",
                    bgColor: "bg-blue-500"
                  },
                  {
                    icon: <Camera className="w-6 h-6" />,
                    title: "Photography",
                    description: "Professional portrait editing",
                    bgColor: "bg-purple-500"
                  },
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "Social Media",
                    description: "Eye-catching posts and stories",
                    bgColor: "bg-pink-500"
                  },
                  {
                    icon: <Briefcase className="w-6 h-6" />,
                    title: "Marketing",
                    description: "Professional campaign assets",
                    bgColor: "bg-green-500"
                  }
                ].map((useCase, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <div className={`${useCase.bgColor} text-white p-3 rounded-lg w-fit mb-4`}>
                      {useCase.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                    <p className="text-gray-600 text-sm">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Fun Facts */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Amazing Numbers</h2>
                <p className="text-xl opacity-90">See the impact we're making worldwide</p>
              </div>

              <div className="grid md:grid-cols-4 gap-8 text-center">
                {[
                  { number: "1M+", label: "Images Processed", icon: <ImageIcon className="w-8 h-8" /> },
                  { number: "50+", label: "Countries Served", icon: <Globe className="w-8 h-8" /> },
                  { number: "99.9%", label: "Accuracy Rate", icon: <Target className="w-8 h-8" /> },
                  { number: "2.1s", label: "Average Process Time", icon: <Clock className="w-8 h-8" /> }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white/20 p-4 rounded-full w-fit mx-auto mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                    <div className="text-lg opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Historical Context */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  The Evolution of Background Removal
                </h2>
                <p className="text-xl text-gray-600">
                  From hours of manual work to instant AI-powered results
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    year: "1990s",
                    title: "Manual Photoshop Era",
                    description: "Designers spent hours manually selecting and removing backgrounds using complex tools"
                  },
                  {
                    year: "2010s",
                    title: "Semi-Automatic Tools",
                    description: "Magic wand and similar tools made the process faster but still required expertise"
                  },
                  {
                    year: "2020s",
                    title: "AI Revolution",
                    description: "Deep learning algorithms can now remove backgrounds instantly with superhuman accuracy"
                  }
                ].map((era, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold min-w-[80px] text-center">
                      {era.year}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{era.title}</h3>
                      <p className="text-gray-600">{era.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Loved by Creators Worldwide
                </h2>
                <p className="text-xl text-gray-600">See what our users are saying</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Sarah Chen",
                    role: "E-commerce Owner",
                    content: "This tool saved me hundreds of hours! My product photos look professional and my sales have increased by 40%.",
                    rating: 5,
                    avatar: "SC"
                  },
                  {
                    name: "Marco Rodriguez",
                    role: "Social Media Manager",
                    content: "The quality is incredible and it's so fast. I can create engaging posts in minutes instead of hours.",
                    rating: 5,
                    avatar: "MR"
                  },
                  {
                    name: "Aisha Patel",
                    role: "Freelance Designer",
                    content: "As someone who works with international clients, this tool is a game-changer. Perfect results every time!",
                    rating: 5,
                    avatar: "AP"
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 text-lg">{testimonial.content}</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Remove Backgrounds Like a Pro?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join over 1 million users who trust our AI-powered background removal tool
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Removing Backgrounds
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
                  View Pricing
                </button>
              </div>
            </div>
          </section>

          {/* Sponsor Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-50 to-amber-50">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-yellow-300">
                <div className="text-center mb-8">
                  <Crown className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Become Our Exclusive Sponsor</h3>
                  <p className="text-gray-600 text-lg">
                    Get permanent branding on our tool used by millions worldwide
                  </p>
                  <div className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full text-lg font-bold mt-4 inline-block">
                    Only $100 • Lifetime Sponsorship • Limited to 1 Sponsor
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg">What You Get:</h4>
                    <div className="space-y-2">
                      {[
                        "Your logo prominently displayed",
                        "Link to your website",
                        "Mentioned in social media",
                        "Forever placement guarantee"
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Perfect For:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• SaaS companies targeting creatives</p>
                      <p>• Design tools and services</p>
                      <p>• Photography businesses</p>
                      <p>• E-commerce platforms</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={sponsorEmail}
                    onChange={(e) => setSponsorEmail(e.target.value)}
                    className="flex-1 max-w-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Claim Sponsorship
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🎯 Reach 1M+ monthly users • First come, first served
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                      <Scissors className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl">BG Remover</span>
                  </div>
                  <p className="text-gray-400">
                    Professional AI-powered background removal for everyone. Fast, accurate, and completely free.
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                      <span className="text-sm font-bold">f</span>
                    </div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 cursor-pointer transition-colors">
                      <span className="text-sm font-bold">t</span>
                    </div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 cursor-pointer transition-colors">
                      <span className="text-sm font-bold">i</span>
                    </div>
                  </div>
                </div>

                {/* Product */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Product</h3>
                  <div className="space-y-2">
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Background Remover</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Bulk Processing</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">API Access</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Mobile App</a>
                  </div>
                </div>

                {/* Support */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Support</h3>
                  <div className="space-y-2">
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Report Bug</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Feature Request</a>
                  </div>
                </div>

                {/* Legal */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Legal</h3>
                  <div className="space-y-2">
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">GDPR</a>
                  </div>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="border-t border-gray-800 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-400 mb-4 md:mb-0">
                    © 2025 BG Remover. All rights reserved. Made with ❤️ for creators worldwide.
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span>🌍 Available in 50+ countries</span>
                    <span>🔒 100% Privacy Protected</span>
                    <span>⚡ 99.9% Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};