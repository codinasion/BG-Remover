import { dictType } from "@/dictionaries";
import { ShoppingBag, Camera, Users, Briefcase } from "lucide-react";

export default function UseCases({
  dict,
}: {
  dict: dictType;
}) {
  return (
    <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {dict.use_cases.text_1}
          </h2>
          <p className="text-xl text-gray-600">
            {dict.use_cases.text_2}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <ShoppingBag className="w-6 h-6" />,
              title: dict.use_cases.text_3,
              description: dict.use_cases.text_4,
              bgColor: "bg-blue-500",
            },
            {
              icon: <Camera className="w-6 h-6" />,
              title: dict.use_cases.text_5,
              description: dict.use_cases.text_6,
              bgColor: "bg-purple-500",
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: dict.use_cases.text_7,
              description: dict.use_cases.text_8,
              bgColor: "bg-pink-500",
            },
            {
              icon: <Briefcase className="w-6 h-6" />,
              title: dict.use_cases.text_9,
              description: dict.use_cases.text_10,
              bgColor: "bg-green-500",
            },
          ].map((useCase, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className={`${useCase.bgColor} text-white p-3 rounded-lg w-fit mb-4`}
              >
                {useCase.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {useCase.title}
              </h3>
              <p className="text-gray-600 text-sm">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
