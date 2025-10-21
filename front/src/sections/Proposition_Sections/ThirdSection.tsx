"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { benefits } from "../propositionData"

const ThirdSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      // Ensure we are targeting the correct scrolling container, which is the main content div in Proposition.tsx
      const scrollingContainer = document.querySelector(".overflow-y-auto") as HTMLElement
      if (!scrollingContainer) {
        console.warn("Scrolling container with class 'overflow-y-auto' not found.")
        return
      }

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const containerTop = scrollingContainer.getBoundingClientRect().top
      const windowHeight = window.innerHeight

      // Calculate the top of the current section relative to the scrollable area's viewport
      const relativeTop = rect.top - containerTop

      // Check if the section is within the scrollable viewport
      if (relativeTop <= 0 && relativeTop + container.offsetHeight >= windowHeight) {
        const scrolled = Math.abs(relativeTop)
        const totalScrollable = container.offsetHeight - windowHeight

        const progress = totalScrollable > 0 ? Math.max(0, Math.min(1, scrolled / totalScrollable)) : 0

        setScrollProgress(progress)
      } else if (relativeTop > 0) {
        // Section is below the viewport
        setScrollProgress(0)
      } else if (relativeTop + container.offsetHeight < windowHeight) {
        // Section is above the viewport
        setScrollProgress(1)
      }
    }

    const scrollingContainer = document.querySelector(".overflow-y-auto")
    if (scrollingContainer) {
      scrollingContainer.addEventListener("scroll", handleScroll, { passive: true })
      // Also listen to window scroll in case the main scroll is on the body/html
      window.addEventListener("scroll", handleScroll, { passive: true })
      handleScroll() // Initial call to set progress
    }

    return () => {
      if (scrollingContainer) {
        scrollingContainer.removeEventListener("scroll", handleScroll)
      }
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const renderSection = (benefit: any, index: number) => {
    const isFirst = index === 0

    const layouts = [
      // Layout 1: Asymmetric Card Design
      <div key={index} className="w-screen h-full relative flex items-center justify-center p-4 md:p-8 bg-white ">
        {isFirst && <div className="absolute top-0 left-0 right-0 h-16 sm:h-32 bg-white z-20"></div>}

        <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div
              className="aspect-[4/3] rounded-xl sm:rounded-3xl bg-cover bg-center mt-8 sm:mt-10 shadow-2xl"
              style={{ backgroundImage: `url(${benefit.image})` }}
            >
              <div className="w-full h-full rounded-xl sm:rounded-3xl  flex items-end p-4 sm:p-8">
                <div className="text-white">
                  <p className="text-xs sm:text-sm uppercase tracking-widest opacity-80 mb-1 sm:mb-2">
                    Featured Solution
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-1 lg:order-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-thin text-gray-700 leading-tight">
              {benefit.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed">
              {benefit.description}
            </p>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 sm:w-12 h-px bg-gray-400"></div>
              <span className="text-xs sm:text-sm text-gray-400 font-light">0{index + 1}</span>
            </div>
          </div>
        </div>
      </div>,

      // Layout 2: Floating Card with Backdrop
      <div
        key={index}
        className="w-screen h-full relative flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-700 leading-none">
                  {benefit.title.split(" ")[0]}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-700">
                  {benefit.title.split(" ").slice(1).join(" ")}
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed max-w-full md:max-w-md">
                {benefit.description}
              </p>
            </div>
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div
                className="aspect-[7/6] w-full max-w-3xl sm:max-w-4xl md:max-w-5xl rounded-xl sm:rounded-2xl bg-fixed bg-center bg-cover shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                style={{ backgroundImage: `url(${benefit.image})` }}
              >
              </div>

            </div>
          </div>
        </div>
      </div>,

      // Layout 3: Split Screen Minimal
      <div key={index} className="w-screen h-full relative bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          <div className="flex items-center justify-center p-4 sm:p-8 lg:p-16 order-2 lg:order-1">
            <div className="max-w-md space-y-6 sm:space-y-8">
              <div className="space-y-1 sm:space-y-2">
                <div className="w-6 sm:w-8 h-px bg-gray-900"></div>
                <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">{benefit.subtitle}</p>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-thin text-gray-700 leading-tight">
                {benefit.title}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">{benefit.description}</p>
            </div>
          </div>
          <div className="relative p-4 sm:p-8 flex items-center justify-center order-1 lg:order-2">
            <div
              className="w-full h-60 sm:h-80 md:h-4/5 rounded-xl sm:rounded-2xl bg-cover bg-center shadow-lg"
              style={{ backgroundImage: `url(${benefit.image})` }}
            >
            </div>
          </div>
        </div>
      </div>,

      // Layout 4: Overlapping Elements
      <div key={index} className="w-screen h-full relative bg-white flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 z-10 relative order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-thin text-gray-700 leading-tight">
                {benefit.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-500 font-light leading-relaxed">
                {benefit.description}
              </p>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-400">{benefit.subtitle}</span>
              </div>
            </div>
            <div className="lg:col-span-7 relative order-1 lg:order-2 flex justify-center">
              <div
                className="aspect-[3/2] w-full max-w-md sm:max-w-lg lg:max-w-none rounded-xl sm:rounded-3xl bg-cover bg-center shadow-2xl transform -rotate-2 relative overflow-hidden"
                style={{ backgroundImage: `url(${benefit.image})` }}
              >
                <div className="w-full h-full rounded-xl sm:rounded-3xl bg-gradient-to-tr from-black/10 to-transparent"></div>

                {/* ✅ Copyright Icon */}
                <div className="absolute bottom-3 left-4 z-40 group">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      className="bg-white text-black text-xs font-medium px-3 py-2 rounded-lg shadow-md border border-gray-200 max-w-[360px] whitespace-normal break-words leading-relaxed"
                    >
                      BusinessWorld, Link: https://www.bworldonline.com/banking-finance/2025/03/17/659539/paymongo-could-raise-fresh-capital-early-next-year/
                      <div className="absolute top-full left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="bg-transparent text-gray-500 duration-300 flex items-center justify-center cursor-default">
                    <span className="text-lg font-bold">&copy;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,

      // Layout 5: Magazine Style 
      <div key={index} className="w-screen h-full relative bg-white flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-2 order-2 lg:order-1 flex justify-center">
            <div
              className="aspect-[16/10] w-full max-w-md sm:max-w-lg lg:max-w-none rounded-xl sm:rounded-2xl bg-cover bg-center shadow-2xl"
              style={{ backgroundImage: `url(${benefit.image})` }}
            >
              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-black/40 via-transparent to-black/20 flex items-end p-4 sm:p-8">
                <div className="text-white">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-light mb-1 sm:mb-2">{benefit.subtitle}</h3>
                  <div className="w-12 sm:w-16 h-px bg-white/60"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-thin text-gray-700 leading-tight">{benefit.title}</h1>
            <p className="text-base sm:text-lg text-gray-500 font-light leading-relaxed">{benefit.description}</p>
            <div className="text-gray-500 text-xs sm:text-sm">
              0{index + 1} / 0{benefits.length}
            </div>
          </div>
        </div>
      </div>,

      // Layout 6: Vertical Stack with Circle Image 
      <div
        key={index}
        className="w-screen h-full relative bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4 md:p-8"
      >
        <div className="text-center space-y-8 sm:space-y-12 max-w-4xl mx-auto">
          <div
            className="w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 mx-auto rounded-full bg-cover bg-center shadow-xl"
            style={{ backgroundImage: `url(${benefit.image})` }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-transparent to-black/20"></div>
            {/* ✅ Copyright Icon */}
            <div className="absolute bottom-3 left-180 top-100 z-40 group">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className="bg-white text-black text-xs font-medium px-3 py-2 rounded-lg shadow-md border border-gray-200 max-w-[360px] whitespace-normal break-words leading-relaxed"
                >
                  The Borgen Project, Link: https://borgenproject.org/safeguarding-overseas-filipino-workers/
                  <div className="absolute top-full left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
              </div>

              {/* Icon */}
              <div className="bg-transparent text-white duration-300 flex items-center justify-center cursor-default">
                <span className="text-lg font-bold">&copy;</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">{benefit.subtitle}</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-700 leading-none">
              {benefit.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-full md:max-w-2xl mx-auto">
              {benefit.description}
            </p>
          </div>
        </div>
      </div>,
    ]

    return layouts[index % layouts.length]
  }

  return (
    <section className="relative">
      {/* Parallax Container */}
      <div ref={containerRef} className="relative" style={{ height: `${benefits.length * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            className="flex h-full will-change-transform"
            style={{
              transform: `translateX(-${scrollProgress * (benefits.length - 1) * 100}vw)`,
              width: `${benefits.length * 100}vw`,
              transition: "none",
            }}
          >
            {benefits.map((benefit, index) => renderSection(benefit, index))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ThirdSection