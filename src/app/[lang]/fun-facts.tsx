import { dictType } from "@/dictionaries";
import { ImageIcon, Globe, Target, Clock } from "lucide-react";

export default function FunFacts({
  dict,
}: {
  dict: dictType;
}) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {dict.fun_facts.text_1}
          </h2>
          <p className="text-xl opacity-90">
            {dict.fun_facts.text_2}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            {
              number: "1M+",
              label: dict.fun_facts.text_3,
              icon: <ImageIcon className="w-8 h-8" />,
            },
            {
              number: "50+",
              label: dict.fun_facts.text_4,
              icon: <Globe className="w-8 h-8" />,
            },
            {
              number: "99.9%",
              label: dict.fun_facts.text_5,
              icon: <Target className="w-8 h-8" />,
            },
            {
              number: "2.1s",
              label: dict.fun_facts.text_6,
              icon: <Clock className="w-8 h-8" />,
            },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/20 p-4 rounded-full w-fit mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
