import type React from "react"

interface TenthSectionProps {
  navigateToLogin: () => void
}

const TenthSection: React.FC<TenthSectionProps> = ({ navigateToLogin }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white py-12 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-16 text-center">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-600 mb-4 tracking-tight leading-tight">
            Online Home <span className="text-sky-500">Services</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 font-normal leading-relaxed max-w-2xl mx-auto">
            Connect with trusted professionals for all your home maintenance and improvement needs
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4 sm:p-6 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">Verified Professionals</h3>
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                Background-checked and certified service providers
              </p>
            </div>

            <div className="flex flex-col items-center p-4 sm:p-6 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">Same-Day Booking</h3>
              <p className="text-xs sm:text-sm text-gray-600 text-center">Quick scheduling for urgent home repairs</p>
            </div>

            <div className="flex flex-col items-center p-4 sm:p-6 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">Satisfaction Guarantee</h3>
              <p className="text-xs sm:text-sm text-gray-600 text-center">100% money-back guarantee on all services</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-12">
            <button
              onClick={navigateToLogin}
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-sky-500 hover:bg-sky-600 text-white text-base sm:text-lg font-medium rounded-2xl transition-colors duration-200"
            >
              Get Started
            </button>

            <button onClick={navigateToLogin} className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gray-100 hover:bg-gray-200 text-sky-500 text-base sm:text-lg font-medium rounded-2xl transition-colors duration-200">
              Browse Services
            </button>
          </div>
          {/* Footer */}
          <div className="text-center border-t border-gray-100 pt-6 sm:pt-8">

            <p className="text-sm text-gray-500 leading-relaxed mb-3 sm:mb-4">
              Found the service you're looking for? Sign up now, or sign in if you already have an account. You can
              review our{" "}
              <a href="#" className="text-sky-500 hover:text-sky-600 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-sky-500 hover:text-sky-600 transition-colors">
                Privacy Policy
              </a>{" "}
              upon creating an account.
            </p>

            <div className="flex items-center justify-center text-xs text-gray-400">
              <span>Powered by HandyGo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TenthSection