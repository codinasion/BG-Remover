import { dictType } from "@/dictionaries";

export default function HistoricalContext({
  dict,
}: {
  dict: dictType;
}) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {dict.historical_context.text_1}
          </h2>
          <p className="text-xl text-gray-600">
            {dict.historical_context.text_2}
          </p>
        </div>

        <div className="space-y-8">
          {[
            {
              year: "1990s",
              title: dict.historical_context.text_3,
              description:dict.historical_context.text_4
            },
            {
              year: "2010s",
              title: dict.historical_context.text_5,
              description:dict.historical_context.text_6
            },
            {
              year: "2020s",
              title: dict.historical_context.text_7,
              description:dict.historical_context.text_8
            },
          ].map((era, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold min-w-[80px] text-center">
                {era.year}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {era.title}
                </h3>
                <p className="text-gray-600">{era.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
