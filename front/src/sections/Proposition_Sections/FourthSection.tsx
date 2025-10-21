import { Twitter } from "lucide-react"
import { tweets } from "../propositionData"

function FourthSection() {
  return (
    <section data-section="reviews" className="bg-white min-h-screen relative py-12 sm:py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Tweet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Left Tweet */}
          <div className="transform lg:-rotate-3 lg:hover:rotate-0 transition-transform duration-300">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-full">
              <div className="p-3 sm:p-4">
                <div className="flex items-center">
                  <img
                    src={tweets[0].avatar || "/placeholder.svg"}
                    alt={tweets[0].name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{tweets[0].name}</span>
                      {tweets[0].verified && (
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-sky-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                        </svg>
                      )}
                      <span className="ml-1 text-xs sm:text-sm text-gray-500">{tweets[0].handle}</span>
                    </div>
                  </div>
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <p className="mt-2 sm:mt-3 text-gray-800 text-sm leading-relaxed">{tweets[0].content}</p>
                <img
                  src={tweets[0].image || "/placeholder.svg"}
                  alt="Tweet attachment"
                  className="mt-2 sm:mt-3 rounded-xl w-full h-32 sm:h-48 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Center Tweet */}
          <div className="transform lg:translate-y-12 lg:hover:translate-y-10 transition-transform duration-300">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-full">
              <div className="p-3 sm:p-4">
                <div className="flex items-center">
                  <img
                    src={tweets[1].avatar || "/placeholder.svg"}
                    alt={tweets[1].name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{tweets[1].name}</span>
                      {tweets[1].verified && (
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-sky-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                        </svg>
                      )}
                      <span className="ml-1 text-xs sm:text-sm text-gray-500">{tweets[1].handle}</span>
                    </div>
                  </div>
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <p className="mt-2 sm:mt-3 text-gray-800 text-sm leading-relaxed">{tweets[1].content}</p>
                <img
                  src={tweets[1].image || "/placeholder.svg"}
                  alt="Tweet attachment"
                  className="mt-2 sm:mt-3 rounded-xl w-full h-32 sm:h-48 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Tweet */}
          <div className="transform lg:rotate-3 lg:hover:rotate-0 transition-transform duration-300">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-full">
              <div className="p-3 sm:p-4">
                <div className="flex items-center">
                  <img
                    src={tweets[2].avatar || "/placeholder.svg"}
                    alt={tweets[2].name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{tweets[2].name}</span>
                      {tweets[2].verified && (
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-sky-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                        </svg>
                      )}
                      <span className="ml-1 text-xs sm:text-sm text-gray-500">{tweets[2].handle}</span>
                    </div>
                  </div>
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <p className="mt-2 sm:mt-3 text-gray-800 text-sm leading-relaxed">{tweets[2].content}</p>
                <img
                  src={tweets[2].image || "/placeholder.svg"}
                  alt="Tweet attachment"
                  className="mt-2 sm:mt-3 rounded-xl w-full h-32 sm:h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="text-center max-w-3xl mx-auto mt-12 sm:mt-16 md:mt-24">
          <span className="text-sky-500 text-sm tracking-wide font-extralight uppercase">Customer Reviews</span>
          <h2 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-medium text-gray-700 leading-tight">
            Our Clients Feedback
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600">
            Join thousands of satisfied customers who trust our services for their needs. Our commitment to excellence,
            attention to detail, and customer satisfaction sets us apart.
          </p>
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-semibold text-sky-500">98%</div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-semibold text-sky-500">100K+</div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-semibold text-sky-500">Cebu</div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Supported Location</div>
            </div>
          </div>
        </div>

        {/* Additional Tweet Cards */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Additional tweets rendering */}
          {tweets.slice(3).map((tweet, index) => (
            <div
              key={index + 3}
              className={`transform ${index === 0 ? "lg:hover:scale-105" : index === 1 ? "lg:translate-y-6 lg:hover:translate-y-3" : "lg:-rotate-2 lg:hover:rotate-0"} transition-transform duration-300`}
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-full">
                <div className="p-3 sm:p-4">
                  <div className="flex items-center">
                    <img
                      src={tweet.avatar || "/placeholder.svg"}
                      alt={tweet.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{tweet.name}</span>
                        {tweet.verified && (
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-sky-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                          </svg>
                        )}
                        <span className="ml-1 text-xs sm:text-sm text-gray-500">{tweet.handle}</span>
                      </div>
                    </div>
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  <p className="mt-2 sm:mt-3 text-gray-800 text-sm leading-relaxed">{tweet.content}</p>
                  <img
                    src={tweet.image || "/placeholder.svg"}
                    alt="Tweet attachment"
                    className="mt-2 sm:mt-3 rounded-xl w-full h-32 sm:h-48 object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FourthSection