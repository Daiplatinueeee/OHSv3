import { Button } from "@/components/ui/button"
import img1 from "../../assets/Terms/2.jpg"

export default function ServiceBanner() {
  return (
    <section className="relative w-full bg-gray-50 overflow-hidden mt-20 mb-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-50"
        style={{ backgroundImage: `url(${img1})` }}
      ></div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-20 gap-12">
        {/* Left text content */}
        <div className="text-left max-w-lg space-y-6">
          <h1 className="text-4xl md:text-5xl font-medium text-white leading-tight drop-shadow-md">
            Not Completely Satisfied With Our <span className="text-sky-500">Service?</span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed">
            Your satisfaction means everything to us. If something didn’t go as expected, please don’t hesitate to reach out.
            Our support team is ready to help and make things right.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button className="px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition">
              Contact Support
            </Button>
            <Button variant="outline" className="px-8 py-4 rounded-full border-white bg-transparent text-white hover:bg-white/10 transition">
              Give Feedback
            </Button>
          </div>
        </div>

        {/* Right decorative box */}
        {/* <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center text-gray-100 shadow-lg max-w-sm">
          <h2 className="text-2xl font-medium mb-3">We’re Listening</h2>
          <p className="text-sm text-gray-200 mb-5">
            Let us know what we can improve — your feedback helps us serve you better.
          </p>
          <Button className="bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition">
            Message Us
          </Button>
        </div> */}
      </div>
    </section>
  )
}