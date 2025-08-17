import { Coffee, Heart } from "lucide-react";

export default function BuyMeACoffee() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center mb-8">
            <Coffee className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Fuel Our Innovation ☕
            </h3>
            <p className="text-gray-600">
              Love this tool? Support us with a virtual coffee and help us keep
              improving!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Buy Coffee ($1)
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            🙏 Thank you for supporting open-source tools!
          </p>
        </div>
      </div>
    </section>
  );
}
