import { Crown, Check } from "lucide-react";

export default function Sponsor() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-50 to-amber-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-yellow-300">
          <div className="text-center mb-8">
            <Crown className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Become Our Exclusive Sponsor
            </h3>
            <p className="text-gray-600 text-lg">
              Get permanent branding on our tool used by millions worldwide
            </p>
            <div className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full text-lg font-bold mt-4 inline-block">
              Only $100 • Lifetime Sponsorship • Limited to 1 Sponsor
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">
                What You Get:
              </h4>
              <div className="space-y-2">
                {[
                  "Your logo prominently displayed",
                  "Link to your website",
                  "Mentioned in social media",
                  "Forever placement guarantee",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 text-lg mb-4">
                Perfect For:
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• SaaS companies targeting creatives</p>
                <p>• Design tools and services</p>
                <p>• Photography businesses</p>
                <p>• E-commerce platforms</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
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
  );
}
