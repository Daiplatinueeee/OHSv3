import type React from "react"
import { useState, useEffect, useRef } from "react"

import img1 from "../../assets/Terms/30.jpg"
import img2 from "../../assets/Terms/31.jpg"
import img3 from "../../assets/Terms/32.jpg"
import img4 from "../../assets/Terms/33.png"
import img5 from "../../assets/Terms/34.jpg"
import img6 from "../../assets/Terms/35.jpg"
import img7 from "../../assets/Terms/38.jpg"

const serviceMetrics = [
  {
    id: 1,
    serviceName: "Plumbing Services",
    provider: "QuickFix Pro",
    description: "Round-the-clock emergency repair services for plumbing, electrical, and HVAC issues in your home.",
    startingPrice: "₱1,000",
    image: img1,
  },
  {
    id: 2,
    serviceName: "Handyman Services",
    provider: "RapidHome Solutions",
    description: "Professional technicians arrive at your doorstep within 2 hours of booking for most home services.",
    startingPrice: "₱650",
    image: img2,
  },
  {
    id: 3,
    serviceName: "HVAC Maintenance",
    provider: "ExpertCare Services",
    description: "Access to over 500 verified and skilled professionals for all your home maintenance needs.",
    startingPrice: "₱8,500",
    image: img3,
  },
  {
    id: 4,
    serviceName: "Landscaping Services",
    provider: "Elite Home Care",
    description: "Consistently high customer satisfaction with quality workmanship and professional service delivery.",
    startingPrice: "₱100 - ₱1,500 per SQM",
    image: img4,
  },
  {
    id: 5,
    serviceName: "Pest Control Services",
    provider: "TrustGuard Services",
    description: "Comprehensive warranty coverage on all completed work to ensure your complete satisfaction.",
    startingPrice: "₱1,800",
    image: img5,
  },
  {
    id: 6,
    serviceName: "Home Cleaning Services",
    provider: "SparkleCare Professionals",
    description: "Thorough and detailed cleaning with flexible schedules that suit your lifestyle.",
    startingPrice: "₱300 - ₱500 per hour",
    image: img6,
  },
  {
    id: 7,
    serviceName: "Create an account to start booking your favorite services!",
    provider: "CareCasa Network",
    description: "Explore a wide range of trusted home service options — from repairs to full renovations, all in one platform.",
    startingPrice: "Check Out More Services",
    image: img7,
  },
]

interface EighthSectionProps {
  onCardSelect: () => void
}

const EighthSection: React.FC<EighthSectionProps> = ({ onCardSelect }) => {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [isClickMode, setIsClickMode] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const firstCardRef = useRef<HTMLDivElement>(null)

  const [actualCardWidth, setActualCardWidth] = useState(500 + 32)
  const [actualTotalSetWidth, setActualTotalSetWidth] = useState(serviceMetrics.length * (500 + 32))

  const [isMobile, setIsMobile] = useState(false)
  const mobileAutoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const updateCardDimensions = () => {
      if (firstCardRef.current) {
        const cardElement = firstCardRef.current
        const style = window.getComputedStyle(cardElement)
        const width = cardElement.offsetWidth + Number.parseFloat(style.marginRight)
        setActualCardWidth(width)
        setActualTotalSetWidth(serviceMetrics.length * width)
      }
    }

    if (!isMobile) {
      updateCardDimensions()
      window.addEventListener("resize", updateCardDimensions)
    } else {
      window.removeEventListener("resize", updateCardDimensions)
    }

    return () => window.removeEventListener("resize", updateCardDimensions)
  }, [isMobile])

  useEffect(() => {
    if (isMobile || isDragging || isClickMode) {
      if (mobileAutoScrollTimerRef.current) {
        clearInterval(mobileAutoScrollTimerRef.current)
        mobileAutoScrollTimerRef.current = null
      }
      return
    }

    const interval = setInterval(() => {
      setTranslateX((prev) => {
        const newValue = prev - 1
        if (actualTotalSetWidth > 0 && Math.abs(newValue) >= actualTotalSetWidth) {
          return newValue + actualTotalSetWidth
        }
        return newValue
      })
    }, 20)

    return () => clearInterval(interval)
  }, [actualTotalSetWidth, isDragging, isMobile, isClickMode])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile || isClickMode) return
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile || isClickMode) return
    e.preventDefault()
    const currentX = e.clientX
    const deltaX = currentX - dragStart
    setTranslateX((prev) => prev + deltaX)
    setDragStart(currentX)
  }

  const handleMouseUp = () => {
    if (!isDragging || isMobile || isClickMode) return
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile || isClickMode) return
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isMobile || isClickMode) return
    e.preventDefault()
    const currentX = e.touches[0].clientX
    const deltaX = currentX - dragStart
    setTranslateX((prev) => prev + deltaX)
    setDragStart(currentX)
  }

  const handleTouchEnd = () => {
    if (!isDragging || isMobile || isClickMode) return
    setIsDragging(false)
  }

  const MetricCard = ({
    metric,
    cardRef,
    onSelect,
    isClickMode,
  }: {
    metric: (typeof serviceMetrics)[0]
    cardRef?: React.Ref<HTMLDivElement>
    onSelect: () => void
    isClickMode: boolean
  }) => (
    <div
      ref={cardRef}
      className={`relative w-full max-w-xs sm:max-w-sm md:max-w-[500px] h-[500px] sm:h-[600px] md:h-[650px] flex-shrink-0 rounded-[8px] overflow-hidden bg-white mr-4 sm:mr-6 md:mr-8 ${isClickMode ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
        }`}
      onClick={isClickMode ? onSelect : undefined}
    >
      <div className="absolute inset-0">
        <img
          src={metric.image || "/placeholder.svg"}
          alt={metric.serviceName}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative h-full flex flex-col text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            {metric.serviceName !== "Create an account to start booking your favorite services!" && (
              <p className="text-sm opacity-75 mb-1 tracking-widest">Approximate price</p>
            )}

            <div className="absolute top-0 left-115 z-40 group">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className="bg-white text-black text-xs font-medium px-3 py-2 rounded-lg shadow-md border border-gray-200 max-w-[360px] whitespace-normal break-words leading-relaxed select-text"
                >
                  Layout (1) by philippinesesim , Link : https://philippinesesim.com/use-cell-phone/ <br />
                  <br />
                  Layout (2) by LalaMove , Link : https://www.lalamove.com/en-ph/newsroom/betis-furnituremakers-success-path <br />
                  <br />
                  Layout (3) by Harvard Edu , Link : https://hir.harvard.edu/overseas-filipino-workers-the-modern-day-heroes-of-the-philippines/ <br />
                  <br />

                  Layout (4) by BusinessWorld , Link : https://www.bworldonline.com/top-stories/2023/04/14/516613/filipino-workers-need-270-years-to-earn-1m/
                  <div className="absolute top-full left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
              </div>

              {/* Icon */}
              <div className="bg-transparent text-white p-2 rounded-full duration-300 flex items-center justify-center cursor-default">
                <span className="text-lg font-bold">&copy;</span>
              </div>
            </div>

            <p className="text-3xl sm:text-4xl font-medium text-green-400">{metric.startingPrice}</p>

          </div>
        </div>


        <div className="mt-auto">
          <h3 className="text-2xl sm:text-3xl font-medium leading-tight mb-2 text-gray-200">{metric.serviceName}</h3>
        </div>
      </div>
    </div>
  )

  const infiniteCards: React.ReactElement[] = []
  if (!isMobile) {
    const numCopies = Math.ceil(window.innerWidth / actualCardWidth) + 2
    for (let i = 0; i < serviceMetrics.length * numCopies; i++) {
      const metric = serviceMetrics[i % serviceMetrics.length]
      infiniteCards.push(
        <MetricCard
          key={`set-${Math.floor(i / serviceMetrics.length)}-card-${metric.id}-${i}`}
          metric={metric}
          cardRef={i === 0 ? firstCardRef : undefined}
          onSelect={onCardSelect}
          isClickMode={isClickMode}
        />,
      )
    }
  }

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden py-12">
      <div className="flex items-center justify-center flex-1">
        {isMobile ? (
          <div className="flex flex-col items-center space-y-8 px-4 w-full">
            {serviceMetrics.map((metric) => (
              <MetricCard
                key={`mobile-card-${metric.id}`}
                metric={metric}
                cardRef={undefined}
                onSelect={onCardSelect}
                isClickMode={true}
              />
            ))}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex items-center select-none mb-25"
            style={{ transform: `translateX(${translateX}px)` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {infiniteCards}
          </div>
        )}
      </div>

      {!isMobile && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-medium">{isClickMode ? "Click Cards" : "Draggable Cards"}</span>
          </div>
          <button
            onClick={() => setIsClickMode((prev) => !prev)}
            className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-full px-4 py-2 transition-colors duration-200"
          >
            Switch to {isClickMode ? "Drag Mode" : "Click Mode"}
          </button>
        </div>
      )}
    </section>
  )
}

export default EighthSection