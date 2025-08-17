import { Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to Remove Backgrounds Like a Pro?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join over 1 million users who trust our AI-powered background removal
          tool
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Start Removing Backgrounds
          </button>
        </div>
      </div>
    </section>
  );
}
