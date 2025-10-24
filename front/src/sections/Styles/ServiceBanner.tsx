import { Button } from "@/components/ui/button"
import img1 from "../../assets/Terms/7-removebg-preview.png"

export default function ServiceBanner() {
  return (
    <section className="relative w-full bg-white overflow-hidden rounded-2xl mt-20 mb-20">
      <div className="flex flex-col lg:flex-row items-center justify-between">
        {/* Left Text Section */}
        <div className="w-full lg:w-1/2 px-8 lg:px-16 py-16 lg:py-20 text-center lg:text-left lg:ml-20 space-y-6">
          <div className="inline-block px-4 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
            Trusted Home Services Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 leading-tight tracking-tight">
            Simplify Your <span className="text-sky-500">Home</span> Life With <span className="text-sky-500">HandyGo</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
            From cleaning to repairs, book certified professionals in seconds.
            Reliable, affordable, and right at your doorstep — all in one place.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Button className="px-10 py-5 text-base font-medium rounded-full bg-sky-500 text-white hover:bg-sky-600 transition">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="px-10 py-5 text-base font-medium rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              View Services
            </Button>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="w-full lg:w-1/2 relative lg:h-[600px] hidden sm:block lg:mr-30">
          <img
            src={img1}
            alt="Home services"
            className="w-full h-full object-cover rounded-t-2xl lg:rounded-none lg:rounded-r-2xl"
          />
        </div>
      </div>
    </section>
  )
}