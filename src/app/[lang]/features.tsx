import { Download, Globe, ImageIcon, Shield, Target, Zap } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Perfect Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI technology meets user-friendly design to deliver
            professional-quality background removal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Lightning Fast",
              description:
                "Process images in under 3 seconds with our optimized AI algorithms",
              color: "from-yellow-400 to-orange-500",
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "100% Private",
              description:
                "Your images are processed locally and never stored on our servers",
              color: "from-green-400 to-blue-500",
            },
            {
              icon: <Globe className="w-8 h-8" />,
              title: "Works Globally",
              description:
                "Optimized for all regions with multi-language support coming soon",
              color: "from-blue-400 to-purple-500",
            },
            {
              icon: <ImageIcon className="w-8 h-8" />,
              title: "High Quality",
              description:
                "Preserve image quality with precise edge detection and anti-aliasing",
              color: "from-purple-400 to-pink-500",
            },
            {
              icon: <Target className="w-8 h-8" />,
              title: "Perfect Precision",
              description:
                "AI-powered edge detection handles complex hair, fur, and fine details",
              color: "from-pink-400 to-red-500",
            },
            {
              icon: <Download className="w-8 h-8" />,
              title: "Multiple Formats",
              description:
                "Download in PNG, JPG, or WebP with transparent or colored backgrounds",
              color: "from-indigo-400 to-blue-500",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group"
            >
              <div
                className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}
              >
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
