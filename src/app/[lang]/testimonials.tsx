import { Star } from "lucide-react";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Creators Worldwide
          </h2>
          <p className="text-xl text-gray-600">See what our users are saying</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "E-commerce Owner",
              content:
                "This tool saved me hundreds of hours! My product photos look professional and my sales have increased by 40%.",
              rating: 5,
              avatar: "SC",
            },
            {
              name: "Marco Rodriguez",
              role: "Social Media Manager",
              content:
                "The quality is incredible and it's so fast. I can create engaging posts in minutes instead of hours.",
              rating: 5,
              avatar: "MR",
            },
            {
              name: "Aisha Patel",
              role: "Freelance Designer",
              content:
                "As someone who works with international clients, this tool is a game-changer. Perfect results every time!",
              rating: 5,
              avatar: "AP",
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
