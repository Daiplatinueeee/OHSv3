import { Button } from "@/components/ui/button"
import img1 from "../../assets/Terms/4.jpg"

export default function ServiceBanner() {
  return (
    <section
      className="relative w-full h-[600px] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${img1})` }}
    >
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/40 backdrop-blur-[1px]"></div>

      {/* Decorative top section */}
      {/* <div className="absolute top-0 left-0 right-0 h-30 bg-gradient-to-b from-white to-transparent"></div> */}
      <div className="absolute top-0 left-0 right-0 h-30 bg-gradient-to-b from-transparent to-transparent"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-3xl px-6">
        <h1 className="text-4xl md:text-6xl font-medium text-white leading-tight drop-shadow-sm">
          Find The Right Company For You
        </h1>
        <p className="mt-5 text-lg md:text-xl text-white leading-relaxed">
          Your satisfaction starts with the right match. Explore trusted companies that fit your needs and make every service stress-free.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="px-8 py-4 rounded-full bg-sky-500 text-white font-medium hover:bg-gray-800 transition">
            Find a Company
          </Button>
          <Button
            variant="outline"
            className="px-8 py-4 rounded-full border-gray-400 text-gray-700 hover:bg-gray-100 transition"
          >
            Explore Services
          </Button>
        </div>
      </div>

      {/* Decorative bottom section */}
      <div className="absolute bottom-0 left-0 right-0 h-30 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  )
}
