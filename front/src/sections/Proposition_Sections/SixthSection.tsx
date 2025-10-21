import type React from "react"
import { sponsorLogos, sponsorQuote } from "../propositionData"

const SixthSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-white py-24 tracking-tight">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-gray-600 mb-4">OUR PARTNERS</h2>
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-gray-600 md:ml-auto">& SPONSORS</h2>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
          {sponsorLogos.map((sponsor, index) => (
            <div key={index} className="flex items-center justify-center group transition-all duration-300">
              <img
                src={sponsor.image || "/placeholder.svg"}
                alt={sponsor.name}
                className="h-12 object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto text-center">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 italic">{sponsorQuote.text}</p>
          <div className="mt-4">
            <p className="text-sky-500 font-semibold">{sponsorQuote.author}</p>
            <p className="text-gray-500 text-sm">{sponsorQuote.role}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SixthSection