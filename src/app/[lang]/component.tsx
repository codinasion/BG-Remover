"use client";

import { dictType } from "@/dictionaries";
import { AlertCircle, X, Upload, Zap, Download } from "lucide-react";
import { InferenceSession } from "onnxruntime-web";
import React, { useState, useRef } from "react";

let session: InferenceSession | null = null;

const loadModel = async () => {
  if (!session) {
    try {
      const ort = await import("onnxruntime-web");

      session = await ort.InferenceSession.create("/models/u2net.quant.onnx", {
        executionProviders: ["wasm"],
      });
    } catch (error) {
      console.error("Failed to load U²-Net model:", error);

      if (
        // @ts-expect-error ignore
        error.message.includes("404") ||
        // @ts-expect-error ignore
        error.message.includes("Not Found")
      ) {
        throw new Error(
          "AI model not found. Please download u2netp.onnx model and place it in public/models/ folder.",
        );
      } else if (
        // @ts-expect-error ignore
        error.message.includes("network") ||
        // @ts-expect-error ignore
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Network error loading AI model. Please check your internet connection and try again.",
        );
      } else {
        throw new Error(
          "Failed to initialize AI model. Your browser may not support this feature.",
        );
      }
    }
  }
  return session;
};

const removeBackgroundFromImage = async (
  image: CanvasImageSource,
  // @ts-expect-error ignore
  onProgress: { (progress): void; (arg0: number): void },
) => {
  try {
    onProgress(10);

    if (!session) {
      await loadModel();
    }

    onProgress(25);

    const ort = await import("onnxruntime-web");

    const H = 320;
    const W = 320;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;

    onProgress(35);

    // @ts-expect-error ignore
    ctx.imageSmoothingEnabled = true;
    // @ts-expect-error ignore
    ctx.imageSmoothingQuality = "high";
    // @ts-expect-error ignore
    ctx.drawImage(image, 0, 0, W, H);
    // @ts-expect-error ignore
    const imgData = ctx.getImageData(0, 0, W, H);

    onProgress(45);

    const float32Data = new Float32Array(3 * W * H);
    for (let i = 0; i < W * H; i++) {
      const r = imgData.data[i * 4] / 255.0;
      const g = imgData.data[i * 4 + 1] / 255.0;
      const b = imgData.data[i * 4 + 2] / 255.0;

      float32Data[i] = Math.min(Math.max(r * 1.05 - 0.025, 0), 1);
      float32Data[i + W * H] = Math.min(Math.max(g * 1.05 - 0.025, 0), 1);
      float32Data[i + 2 * W * H] = Math.min(Math.max(b * 1.05 - 0.025, 0), 1);
    }

    const tensor = new ort.Tensor("float32", float32Data, [1, 3, H, W]);

    onProgress(60);

    let results;
    try {
      // @ts-expect-error ignore
      results = await session.run({ "input.1": tensor });
    } catch (error) {
      try {
        // @ts-expect-error ignore
        results = await session.run({ input: tensor });
      } catch (error2) {
        try {
          // @ts-expect-error ignore
          results = await session.run({ data: tensor });
        } catch (error3) {
          // @ts-expect-error ignore
          const inputNames = session.inputNames;
          console.log("Available input names:", inputNames);

          if (inputNames.length > 0) {
            const inputFeed = {};
            // @ts-expect-error ignore
            inputFeed[inputNames[0]] = tensor;
            // @ts-expect-error ignore
            results = await session.run(inputFeed);
          } else {
            throw new Error(
              "Could not determine model input name. Please check the model file.",
            );
          }
        }
      }
    }

    onProgress(80);

    let output;
    const outputNames = Object.keys(results);
    console.log("Available output names:", outputNames);

    if (outputNames.length > 0) {
      output = results[outputNames[0]];
    } else {
      throw new Error("No model outputs found.");
    }

    const maskData = output.data;

    const processedMask = new Float32Array(W * H);

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const idx = y * W + x;
        const center = maskData[idx];

        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            neighbors.push(maskData[(y + dy) * W + (x + dx)]);
          }
        }

        let weightedSum = 0;
        let totalWeight = 0;

        neighbors.forEach((neighbor) => {
          // @ts-expect-error ignore
          const weight = Math.exp(-Math.abs(neighbor - center) * 5);
          // @ts-expect-error ignore
          weightedSum += neighbor * weight;
          totalWeight += weight;
        });

        processedMask[idx] = weightedSum / totalWeight;
      }
    }

    for (let i = 0; i < W * H; i++) {
      const value = processedMask[i];

      processedMask[i] = 1 / (1 + Math.exp(-12 * (value - 0.5)));
    }

    onProgress(90);

    const resultCanvas = document.createElement("canvas");
    // @ts-expect-error ignore
    resultCanvas.width = image.naturalWidth;
    // @ts-expect-error ignore
    resultCanvas.height = image.naturalHeight;
    const resultCtx = resultCanvas.getContext("2d");

    // @ts-expect-error ignore
    resultCtx.imageSmoothingEnabled = true;
    // @ts-expect-error ignore
    resultCtx.imageSmoothingQuality = "high";

    // @ts-expect-error ignore
    resultCtx.drawImage(image, 0, 0);
    // @ts-expect-error ignore
    const imageData = resultCtx.getImageData(
      0,
      0,
      // @ts-expect-error ignore
      image.naturalWidth,
      // @ts-expect-error ignore
      image.naturalHeight,
    );

    // @ts-expect-error ignore
    for (let y = 0; y < image.naturalHeight; y++) {
      // @ts-expect-error ignore
      for (let x = 0; x < image.naturalWidth; x++) {
        // @ts-expect-error ignore
        const maskX = (x / image.naturalWidth) * (W - 1);
        // @ts-expect-error ignore
        const maskY = (y / image.naturalHeight) * (H - 1);

        const x1 = Math.floor(maskX);
        const y1 = Math.floor(maskY);
        const x2 = Math.min(x1 + 1, W - 1);
        const y2 = Math.min(y1 + 1, H - 1);

        const dx = maskX - x1;
        const dy = maskY - y1;

        const tl = processedMask[y1 * W + x1];
        const tr = processedMask[y1 * W + x2];
        const bl = processedMask[y2 * W + x1];
        const br = processedMask[y2 * W + x2];

        const top = tl + (tr - tl) * dx;
        const bottom = bl + (br - bl) * dx;
        const alpha = top + (bottom - top) * dy;

        // @ts-expect-error ignore
        const pixelIdx = (y * image.naturalWidth + x) * 4;
        imageData.data[pixelIdx + 3] = Math.round(
          Math.max(0, Math.min(255, alpha * 255)),
        );
      }
    }

    // @ts-expect-error ignore
    resultCtx.putImageData(imageData, 0, 0);

    onProgress(100);

    return resultCanvas.toDataURL("image/png");
  } catch (error) {
    console.error("Background removal failed:", error);
    throw new Error(
      // @ts-expect-error ignore
      error.message || "Failed to remove background. Please try again.",
    );
  }
};

export default function Component({ dict }: { dict: dictType }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageElement, setSelectedImageElement] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // @ts-expect-error ignore
  const handleImageUpload = (event: { target: { files } }) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        // @ts-expect-error ignore
        setError("Please upload a valid image file (JPG, PNG, or WebP)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // @ts-expect-error ignore
        setError("Image size must be less than 10MB");
        return;
      }

      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        // @ts-expect-error ignore
        setSelectedImage(e.target.result);
        setProcessedImage(null);

        const img = new Image();
        img.onload = () => {
          // @ts-expect-error ignore
          setSelectedImageElement(img);
        };
        // @ts-expect-error ignore
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedImageElement) {
      // @ts-expect-error ignore
      setError("Please select an image first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);

    try {
      if (!modelLoaded) {
        setProcessingProgress(5);
        await loadModel();
        setModelLoaded(true);
      }

      const resultUrl = await removeBackgroundFromImage(
        selectedImageElement,
        (progress: React.SetStateAction<number>) =>
          setProcessingProgress(progress),
      );

      // @ts-expect-error ignore
      setProcessedImage(resultUrl);
    } catch (error) {
      setError(
        // @ts-expect-error ignore
        error.message || "Failed to remove background. Please try again.",
      );
      console.error("Background removal error:", error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  };

  const downloadImage = async () => {
    if (processedImage) {
      try {
        const link = document.createElement("a");
        link.download = `bg-removed-${Date.now()}.png`;
        link.href = processedImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download failed:", error);
        // @ts-expect-error ignore
        setError("Failed to download image. Please try again.");
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
    <section id="component" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {dict.component.text_1}
          </h2>
          <p className="text-gray-600 text-lg">{dict.component.text_2}</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          {/* Regular error display for other errors */}
          {/* @ts-expect-error ignore */}
          {error && !error.includes("model not found") && (
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
              // @ts-expect-error ignore
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 cursor-pointer transition-colors bg-white"
            >
              <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {dict.component.text_3}
              </h3>
              <p className="text-gray-600 mb-4">{dict.component.text_4}</p>
              <p className="text-sm text-gray-500">{dict.component.text_5}</p>
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
                <h4 className="font-semibold text-gray-900 mb-3 text-center">
                  {dict.component.text_6}
                </h4>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="w-full h-64 object-contain rounded"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-center">
                  {dict.component.text_7}
                </h4>
                <div className="bg-white rounded-lg p-4 shadow-sm relative">
                  {processedImage ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded opacity-30"></div>
                      <img
                        src={processedImage}
                        alt="Background Removed"
                        className="w-full h-64 object-contain rounded relative z-10"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                      {isProcessing ? (
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">
                                {Math.round(processingProgress)}%
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 font-medium">
                            {dict.component.text_8}
                          </p>
                          <div className="w-48 bg-gray-200 rounded-full h-2 mt-3">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${processingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">{dict.component.text_9}</p>
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
                  {dict.component.text_10}
                </button>
              )}

              {processedImage && (
                <button
                  onClick={downloadImage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {dict.component.text_11}
                </button>
              )}

              <button
                onClick={resetTool}
                disabled={isProcessing}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dict.component.text_12}
              </button>
            </div>
          )}

          {/* Tips for better results */}
          {selectedImage && !processedImage && !isProcessing && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">
                💡 {dict.component.text_13}:
              </h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• {dict.component.text_14}</li>
                <li>• {dict.component.text_15}</li>
                <li>• {dict.component.text_16}</li>
                <li>• {dict.component.text_17}</li>
                <li>• {dict.component.text_18}</li>
              </ul>
            </div>
          )}

          {/* Model loading info */}
          {!modelLoaded && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-amber-800 text-sm">
                  {dict.component.text_19}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
