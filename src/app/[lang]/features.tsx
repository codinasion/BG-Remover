import { dictType } from "@/dictionaries";
import { Download, Globe, ImageIcon, Shield, Target, Zap } from "lucide-react";

export default function Features({ dict }: { dict: dictType }) {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {dict.features.text_1}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {dict.features.text_2}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8" />,
              title: dict.features.text_3,
              description: dict.features.text_4,
              color: "from-yellow-400 to-orange-500",
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: dict.features.text_5,
              description: dict.features.text_6,
              color: "from-green-400 to-blue-500",
            },
            {
              icon: <Globe className="w-8 h-8" />,
              title: dict.features.text_7,
              description: dict.features.text_8,
              color: "from-blue-400 to-purple-500",
            },
            {
              icon: <ImageIcon className="w-8 h-8" />,
              title: dict.features.text_9,
              description: dict.features.text_10,
              color: "from-purple-400 to-pink-500",
            },
            {
              icon: <Target className="w-8 h-8" />,
              title: dict.features.text_11,
              description: dict.features.text_12,
              color: "from-pink-400 to-red-500",
            },
            {
              icon: <Download className="w-8 h-8" />,
              title: dict.features.text_13,
              description: dict.features.text_14,
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
