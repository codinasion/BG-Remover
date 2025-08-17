import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="mb-6">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              🚀 #1 AI Background Remover Tool
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Remove Image Backgrounds Instantly
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional AI-powered background removal in seconds. Perfect for
            e-commerce, social media, and creative projects. No design skills
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              // onClick={() =>
              //     document.getElementById("tool").scrollIntoView()
              // }
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Try Free Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
