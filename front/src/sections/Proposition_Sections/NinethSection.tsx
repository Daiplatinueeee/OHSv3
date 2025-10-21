import type React from "react"

type NinthSectionProps = {}

const NinthSection: React.FC<NinthSectionProps> = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-24 overflow-hidden tracking-tight">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left Side - Typography */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl text-gray-600 leading-tight">
                Become Part of Our
                <span className="block mt-2 text-sky-500">Growing Family</span>
              </h2>
            </div>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Join thousands of professionals who trust HandyGo for exceptional service experiences. Our network
              continues to expand, bringing quality solutions to more locations every day.
            </p>

            <div className="space-y-6">
              <div className="group p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-sky-500 rounded-2xl flex items-center justify-center text-lg sm:text-xl text-white font-medium">
                    1
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Register Your Account</h3>
                    <p className="mt-1 text-sm sm:text-base text-gray-500">
                      Complete a simple registration process with your basic details
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-sky-500 rounded-2xl flex items-center justify-center text-lg sm:text-xl text-white font-medium">
                    2
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Create Your Profile</h3>
                    <p className="mt-1 text-sm sm:text-base text-gray-500">
                      Set up your professional profile highlighting your expertise
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-sky-500 rounded-2xl flex items-center justify-center text-lg sm:text-xl text-white font-medium">
                    3
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Start Your Journey</h3>
                    <p className="mt-1 text-sm sm:text-base text-gray-500">
                      Begin connecting with clients and growing your business
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="relative space-y-6">
            {/* Hidden on small screens, block on medium and up */}
            <div className="absolute inset-0 bg-sky-100 rounded-[40px] transform rotate-3 hidden sm:block"></div>
            <div className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Professional Network</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Connect with industry experts</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden">
                        <img
                          src={`https://i.pravatar.cc/100?img=${20 + i}`}
                          alt={`Team member ${i}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-sky-100 ring-2 ring-white text-sky-600 font-medium text-sm">
                      +58
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50">
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">5K+</div>
                    <div className="text-sm text-gray-500">Active Members</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50">
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">95%</div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Network Highlights</h3>
                  <span className="text-sm text-sky-600">View all</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Top Rated Services</span>
                      <span className="text-sm text-sky-500">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Client Satisfaction</span>
                      <span className="text-sm text-sky-500">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Service Growth</span>
                      <span className="text-sm text-sky-500">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NinthSection