import { useEffect, useState, useRef } from "react"
import { X, Blend, WindArrowDown } from "lucide-react"
import { aboutHandyGo } from "../sections/propositionData"
import { useNavigate } from "react-router-dom"

import HeroSection from "../sections/Proposition_Sections/HeroSection"

import SecondSection from "../sections/Proposition_Sections/SecondSection"
import ThirdSection from "../sections/Proposition_Sections/ThirdSection"
import FourthSection from "../sections/Proposition_Sections/FourthSection"
import SixthSection from "../sections/Proposition_Sections/SixthSection"
import SeventhSection from "../sections/Proposition_Sections/SeventhSection"
import EighthSection from "../sections/Proposition_Sections/EightSection"
import NinthSection from "../sections/Proposition_Sections/NinethSection"
import TenthSection from "../sections/Proposition_Sections/TenthSection"

import img1 from "../assets/proposition/team photo/kc.jpg"
import img2 from "../assets/proposition/team photo/kath.jpg"
import img3 from "../assets/proposition/team photo/bens.jfif"
import img4 from "../assets/proposition/team photo/kyle.jpg"
import img5 from "../assets/proposition/team photo/waris.jpg"
import img6 from "../assets/proposition/team photo/jv.jpg"
import { motion } from "framer-motion"

function Proposition() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [firstSpread, setFirstSpread] = useState(false)
  const [, setSecondSpread] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [hoveredContactHeader, setHoveredContactHeader] = useState(false)
  const [hoveredContactPhone, setHoveredContactPhone] = useState(false)
  const [currentAboutSection, setCurrentAboutSection] = useState(0)
  const [hoveredTeamMember, setHoveredTeamMember] = useState("")
  const [imageTransitioning, setImageTransitioning] = useState(false)

  // New states for floating indicator
  const [showFloatingIndicator, setShowFloatingIndicator] = useState(false)
  const [showSpeechBubble, setShowSpeechBubble] = useState(false)
  const [isFloatingIndicatorIdle, setIsFloatingIndicatorIdle] = useState(false)
  const [showNavigationCloud, setShowNavigationCloud] = useState(false)
  const [isClosingCloud, setIsClosingCloud] = useState(false)

  const heroRef = useRef<HTMLDivElement | null>(null)
  const aboutSectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false)

  const [matrixText, setMatrixText] = useState("")



  const teamMemberImages = {
    "KIMBERLY BARON CAÑON AS PROJECT MANAGER": img1,
    "KATHLEEN REPUNTE AS DOCUMTENTOR": img2,
    "VINCE EDWARD CAÑEDO MAÑACAP AS DEVELOPER": img3,
    "KYLE SELLOTE AS DEVELOPER": img4,
    "BART JUAREZ AS SYSTEM ANALYST": img5,
    "JOSH VINCENT S. ALMENDRAS AS DOCUMENTOR": img6,
  }

  const defaultImage = img2

  // Navigation sections for the cloud
  const navigationSections = [
    { name: "Home", target: "hero-sections" },
    { name: "Who Are We", target: "who-we-are" },
    { name: "Benefits", target: "benefits" },
    { name: "Reviews", target: "reviews" },
    { name: "About HG", target: "about-handygo" },
    { name: "Sponsors", target: "sponsors" },
    { name: "Features", target: "features" },
    { name: "Services", target: "services" },
    { name: "How To Join", target: "join" },
    { name: "Get Started", target: "get-started" },
  ]

  // Floating Indicator Timer Effect
  useEffect(() => {
    if (!loading && heroAnimationComplete) {
      const timer = setTimeout(() => {
        setShowFloatingIndicator(true)

        // Show speech bubble for 10 seconds initially
        setShowSpeechBubble(true)
        setTimeout(() => {
          setShowSpeechBubble(false)
          // Set opacity to 50% after 10 seconds of being idle
          setIsFloatingIndicatorIdle(true)
        }, 5000)
      }, 2000) // Show indicator after 5 second

      return () => clearTimeout(timer)
    }
  }, [loading, heroAnimationComplete])

  useEffect(() => {
    const loadingMessages = [
      "Getting the mop ready",
      "Warming up the tools",
      "Organizing the service kits",
      "Checking availability of providers",
      "Starting HandyGo systems",
      "Connecting to our team",
      "Preparing your booking experience",
      "Almost there",
      "Finalizing setup",
      "Ready to roll",
    ]

    let messageIndex = 0
    let charIndex = 0
    let dots = ""
    let localProgress = 0
    let typingTimeout: NodeJS.Timeout
    let dotInterval: NodeJS.Timeout

    const typeMessage = () => {
      const message = loadingMessages[messageIndex]

      if (charIndex < message.length) {
        setMatrixText(message.slice(0, charIndex + 1))
        charIndex++
        typingTimeout = setTimeout(typeMessage, 60) // typing speed
      } else {
        // Start the dots animation after the message finishes typing
        dotInterval = setInterval(() => {
          dots = dots.length < 3 ? dots + "." : ""
          setMatrixText(`${message}${dots}`)
        }, 400)
      }
    }

    typeMessage()

    const progressInterval = setInterval(() => {
      localProgress += 2
      setProgress(localProgress)

      if (localProgress % 20 === 0 && messageIndex < loadingMessages.length - 1) {
        // Move to the next message every ~20% progress
        clearInterval(dotInterval)
        charIndex = 0
        dots = ""
        messageIndex++
        typeMessage()
      }

      if (localProgress >= 100) {
        clearInterval(progressInterval)
        clearInterval(dotInterval)
        clearTimeout(typingTimeout)

        // Final animation sequence
        setTimeout(() => {
          setFirstSpread(true)
          setTimeout(() => {
            setSecondSpread(true)
            setTimeout(() => {
              setLoading(false)
              setHeroAnimationComplete(true)
            }, 30)
          }, 800)
        }, 500)
      }
    }, 120)

    return () => {
      clearInterval(progressInterval)
      clearInterval(dotInterval)
      clearTimeout(typingTimeout)
    }
  }, [])


  const [textAnimating, setTextAnimating] = useState(false)
  const navigate = useNavigate() // Changed from useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset
        const rate = scrolled * 0.5
        heroRef.current.style.backgroundPosition = `center ${rate}px`
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = aboutSectionRefs.current.findIndex((ref) => ref === entry.target)
              if (index !== -1 && currentAboutSection !== index) {
                setTextAnimating(true)
                setTimeout(() => {
                  setCurrentAboutSection(index)
                  setTimeout(() => {
                    setTextAnimating(false)
                  }, 400)
                }, 200)
              }
            }
          })
        },
        {
          root: null,
          rootMargin: "-20% 0px -20% 0px",
          threshold: [0.2, 0.5, 0.8],
        },
      )

      aboutSectionRefs.current.forEach((ref) => {
        if (ref) {
          observer.observe(ref)
        }
      })

      return () => {
        aboutSectionRefs.current.forEach((ref) => {
          if (ref) {
            observer.unobserve(ref)
          }
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [currentAboutSection])

  const scrollToSection = (sectionName: string) => {
    if (sectionName === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (sectionName === "contact") {
      setShowContact(true)
    } else {
      const section =
        document.querySelector(`[data-section="${sectionName}"]`) ||
        document.querySelector(`section:nth-of-type(${getSectionIndex(sectionName)})`)
      section?.scrollIntoView({ behavior: "smooth" })
    }

    // Start closing animation
    setIsClosingCloud(true)
    setTimeout(() => {
      setShowNavigationCloud(false)
      setIsClosingCloud(false)
    }, 500) // Adjusted timing for fade animation
  }

  const getSectionIndex = (sectionName: string) => {
    const sectionMap: { [key: string]: number } = {
      "who-we-are": 2,
      benefits: 3,
      reviews: 4,
      "about-handygo": 5,
      sponsors: 6,
      features: 7,
      services: 8,
      join: 9,
    }
    return sectionMap[sectionName] || 1
  }

  const navigateToLogin = () => {
    navigate("/login") // Changed from router.push("/login")
  }

  const handleTeamMemberHover = (memberName: string) => {
    if (memberName !== hoveredTeamMember) {
      setImageTransitioning(true)
      setTimeout(() => {
        setHoveredTeamMember(memberName)
        setTimeout(() => {
          setImageTransitioning(false)
        }, 300)
      }, 200)
    }
  }

  const handleTeamMemberLeave = () => {
    setImageTransitioning(true)
    setTimeout(() => {
      setHoveredTeamMember("")
      setTimeout(() => {
        setImageTransitioning(false)
      }, 300)
    }, 200)
  }

  const getCurrentImage = () => {
    if (hoveredTeamMember && teamMemberImages[hoveredTeamMember as keyof typeof teamMemberImages]) {
      return teamMemberImages[hoveredTeamMember as keyof typeof teamMemberImages]
    }
    return defaultImage
  }

  const handleFloatingIndicatorClick = () => {
    setShowSpeechBubble(false)
    if (showNavigationCloud) {
      // Start closing animation
      setIsClosingCloud(true)
      setTimeout(() => {
        setShowNavigationCloud(false)
        setIsClosingCloud(false)
      }, 500) // Adjusted timing for fade animation
    } else {
      setShowNavigationCloud(true)
      setIsClosingCloud(false)
    }
  }

  const handleCloseNavigationCloud = () => {
    setIsClosingCloud(true)
    setTimeout(() => {
      setShowNavigationCloud(false)
      setIsClosingCloud(false)
    }, 500) // Adjusted timing for fade animation
  }

  const handleFloatingIndicatorHover = () => {
    setShowSpeechBubble(true)
    setIsFloatingIndicatorIdle(false) // Reset idle state on hover
  }

  const handleFloatingIndicatorLeave = () => {
    if (!showNavigationCloud) {
      setShowSpeechBubble(false)
    }
  }

  return (
    <>
      {/* Navigation Cloud */}
      <div
        className={`fixed inset-0 z-[80] transition-all duration-500 ease-out font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${showNavigationCloud ? "opacity-100 backdrop-blur-sm" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="absolute inset-0 bg-black/20" onClick={handleCloseNavigationCloud}></div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="relative w-full h-full">
            {/* Navigation Items in Circular Formation */}
            {navigationSections.map((section, index) => {
              const angle = (index * 360) / navigationSections.length
              const radius = 220 // Radius for spacing
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius

              // Simple staggered fade animation
              const fadeDelay = isClosingCloud
                ? (navigationSections.length - 1 - index) * 50 // Reverse order for closing
                : index * 50 // Normal order for opening

              return (
                <button
                  key={section.name}
                  onClick={() => scrollToSection(section.target)}
                  className={`absolute bg-white hover:bg-sky-500 text-gray-700 hover:text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 group w-32 ${showNavigationCloud && !isClosingCloud ? "fade-in" : isClosingCloud ? "fade-out" : "opacity-0"
                    }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: "translate(-50%, -50%)",
                    animationDelay: `${fadeDelay}ms`,
                  }}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-extralight text-center truncate">{section.name}</span>
                  </div>
                </button>
              )
            })}

            {/* Center Close Button */}
            <button
              onClick={handleCloseNavigationCloud}
              className={`absolute bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${showNavigationCloud && !isClosingCloud ? "fade-in" : isClosingCloud ? "fade-out" : "opacity-0"
                }`}
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                animationDelay: `${isClosingCloud ? "0ms" : navigationSections.length * 50}ms`, // Center button appears last when opening, first when closing
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Indicator */}
      <div
        className={`fixed bottom-8 right-8 z-[70] transition-all duration-700 ease-out font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${showFloatingIndicator
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-10 scale-75 pointer-events-none"
          }`}
      >
        {/* Speech Bubble */}
        <div
          className={`absolute bottom-full right-0 mb-4 transition-all duration-500 ease-out ${showSpeechBubble
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
            }`}
        >
          <div className="relative bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-700">Click me for easy navigation</div>
            {/* Speech bubble arrow */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-200 transform translate-y-px"></div>
          </div>
        </div>

        {/* Floating Button */}
        <button
          onClick={handleFloatingIndicatorClick}
          onMouseEnter={handleFloatingIndicatorHover}
          onMouseLeave={handleFloatingIndicatorLeave}
          className={`bg-sky-400 text-white p-3 rounded-full shadow-lg hover:bg-sky-500 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 hover:scale-110 active:scale-95 ${isFloatingIndicatorIdle ? "opacity-50 hover:opacity-100" : "opacity-100"
            }`}
          aria-label="Navigate faster"
        >
          <Blend size={20} />
        </button>
      </div>

      {/* Contact Overlay */}
      <div className="fixed inset-0 z-[60] pointer-events-none">
        <div
          className={`fixed inset-x-0 top-0 bg-white h-1/2 transition-transform duration-700 ease-in-out ${showContact ? "translate-y-0" : "-translate-y-full"}`}
          style={{ transformOrigin: "top" }}
        />
        <div
          className={`fixed inset-x-0 bottom-0 bg-white h-1/2 transition-transform duration-700 ease-in-out ${showContact ? "translate-y-0" : "translate-y-full"}`}
          style={{ transformOrigin: "bottom" }}
        />

        {/* Contact Content */}
        <div
          className={`fixed inset-0 flex items-center justify-center transition-all duration-500 pointer-events-auto ${showContact ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <button
            onClick={() => setShowContact(false)}
            className="absolute top-8 right-8 text-black hover:opacity-70 transition-opacity contact-text"
          >
            <span className="ml-2 text-sm tracking-wide flex items-center cursor-pointer ">
              <X size={20} className="mr-1" />
              CLOSE
            </span>
          </button>

          <div className="max-w-4xl w-full mx-auto px-6">
            <div className="text-center mb-6">
              <span className="text-xs tracking-widest text-gray-400 contact-text opacity-0 fade-slide-up delay-1">
                FACEBOOK
              </span>
            </div>

            <div className="relative mb-20">
              <div
                className={`absolute inset-0 bg-sky-400 transition-transform duration-300 ease-in-out rounded-2xl ${hoveredContactHeader ? "scale-x-100" : "scale-x-0"}`}
                style={{ transformOrigin: "left" }}
              />
              <h2
                className={`relative text-5xl md:text-6xl lg:text-7xl text-center contact-heading mb-4 transition-colors duration-300 cursor-pointer opacity-0 fade-slide-up delay-2`}
                onMouseEnter={() => setHoveredContactHeader(true)}
                onMouseLeave={() => setHoveredContactHeader(false)}
              >
                <span
                  className={`transition-colors duration-300 font-extralight font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${hoveredContactHeader ? "text-white" : "text-gray-700"}`}
                >
                  CONTACT @ <span className={hoveredContactHeader ? "text-white" : "text-sky-400"}>HANDYGO</span>
                </span>
              </h2>

              <div
                className={`absolute inset-0 top-[4.5rem] bg-sky-400 transition-transform duration-300 ease-in-out rounded-2xl ${hoveredContactPhone ? "scale-x-100" : "scale-x-0"}`}
                style={{ transformOrigin: "left" }}
              />
              <h2
                className={`relative text-4xl md:text-5xl lg:text-6xl text-center contact-heading mb-16 transition-colors duration-300 cursor-pointer opacity-0 fade-slide-up delay-3`}
                onMouseEnter={() => setHoveredContactPhone(true)}
                onMouseLeave={() => setHoveredContactPhone(false)}
              >
                <span
                  className={`transition-colors duration-300 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] font-extralight ${hoveredContactPhone ? "text-white" : "text-gray-700"}`}
                >
                  (+63) 96 057 2055
                </span>
              </h2>
            </div>

            <div className="space-y-8 contact-details">
              <div className="flex justify-between items-center border-b border-gray-100 pb-6 opacity-0 fade-slide-up delay-1  font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
                <div className="text-gray-500">KIMBERY CAÑON / PROJECT MANAGER</div>
                <div className="text-gray-900">KIMBERYCAÑON16@GMAIL.COM / (+63) 96 452 7563</div>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-6 opacity-0 fade-slide-up delay-2 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
                <div className="text-gray-500">KATHLEEN REPUNTE / DOCUMENTOR</div>
                <div className="text-gray-900">KATHREPUNTE44@GMAIL.COM / (+63) 95 222 4625</div>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-6 opacity-0 fade-slide-up delay-3 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
                <div className="text-gray-500">VINCE EDWARD MAÑACAP / DEVELOPER</div>
                <div className="text-gray-900">VINCEEDWARD480@GMAIL.COM / (+63) 96 245 2324</div>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-6 opacity-0 fade-slide-up delay-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
                <div className="text-gray-500">BART JAY JUAREZ / ANALYST</div>
                <div className="text-gray-900">BARTOLOMS122@GMAIL.COM / (+63) 96 057 2055</div>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-6 opacity-0 fade-slide-up delay-5 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
                <div className="text-gray-500">KYLE SELLOTE / DEVELOPER</div>
                <div className="text-gray-900">KYLEPARDILLO55@GMAIL.COM / (+63) 96 057 2055</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-sky-400 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] transition-opacity duration-500 overflow-hidden">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center text-3xl font-medium mb-6 space-x-2">
              <span className="text-sky-400 text-4xl">HandyGo</span>
              <WindArrowDown className="w-8 h-8 mb-2" />
            </div>

            {/* Matrix Text */}
            <div className="h-6 text-gray-500 mb-4 text-center text-sm tracking-wide font-medium">
              {matrixText}
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-sky-400 rounded overflow-hidden">
              <div
                className="h-full bg-gray-200 transition-all ease-out duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress Percentage */}
            <div className="mt-2 text-sm text-gray-500">{progress}%</div>
          </div>

          {/* Spread Animations */}
          {firstSpread && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-sky-300 via-sky-200 to-white z-30"
            />
          )}

        </div>
      )}



      {/* Main Content */}
      <div
        className={`fixed inset-0 z-50 bg-black text-white transition-all duration-1000 overflow-y-auto overflow-x-hidden font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${heroAnimationComplete ? "opacity-100" : "opacity-0"}`}
      >
        {/* First Section - Hero */}
        <HeroSection />

        {/* Second Section - Who We Are */}
        <SecondSection
          hoveredTeamMember={hoveredTeamMember}
          handleTeamMemberHover={handleTeamMemberHover}
          handleTeamMemberLeave={handleTeamMemberLeave}
          getCurrentImage={getCurrentImage}
          imageTransitioning={imageTransitioning}
        />

        {/* Third Section - Benefits */}
        <div data-section="benefits">
          <ThirdSection />
        </div>

        {/* Fourth Section - Reviews & Tweets */}
        <FourthSection />

        {/* Fifth Section - About HandyGo */}
        <section
          data-section="about-handygo"
          className={`relative min-h-screen transition-colors duration-700 ease-in-out ${aboutHandyGo[currentAboutSection].bgColor}`}
        >
          <div className="max-w-7xl mx-auto px-6 py-24">
            {/* Copyright Icon + Tooltip */}
            <div className="absolute bottom-0 left-0  z-30 group">
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
              <div className="bg-transparent text-gray-500 p-2 rounded-full duration-300 flex items-center justify-center cursor-default">
                <span className="text-lg font-bold">&copy;</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-55 md:mt-15">
              <div className="col-span-12 text-center sticky top-1/2 -translate-y-1/2 md:col-span-5 md:top-60 md:h-fit md:mr-10 md:ml-[-2rem] md:text-left">
                <img
                  src={aboutHandyGo[currentAboutSection].image || "/placeholder.svg"}
                  alt={aboutHandyGo[currentAboutSection].title}
                  className={`w-full max-w-xs h-auto object-contain mb-8 block md:hidden transition-opacity duration-700 ${imageTransitioning ? "opacity-0" : "opacity-100"}`}
                />
                <div className="space-y-5 overflow-hidden flex flex-col items-center md:items-start mr-10 md:mr-0 md:mt-80">
                  <span
                    className={`text-sm font-medium tracking-wide uppercase transition-all duration-700 ease-out block ${textAnimating
                      ? "blur-lg opacity-0 transform translate-y-4"
                      : "blur-0 opacity-100 transform translate-y-0"
                      } ${aboutHandyGo[currentAboutSection].accentColor}`}
                  >
                    About HandyGo
                  </span>
                  <h2
                    className={`text-3xl sm:text-4xl lg:text-4xl font-medium text-gray-600 leading-tight transition-all duration-700 ease-out block ${textAnimating
                      ? "blur-lg opacity-0 transform translate-y-6"
                      : "blur-0 opacity-100 transform translate-y-0"
                      }`}
                  >
                    {aboutHandyGo[currentAboutSection].title}
                  </h2>
                  <div
                    className={`text-lg sm:text-xl lg:text-xl font-medium transition-all duration-700 ease-out block ${textAnimating
                      ? "blur-lg opacity-0 transform translate-y-8"
                      : "blur-0 opacity-100 transform translate-y-0"
                      } ${aboutHandyGo[currentAboutSection].accentColor}`}
                  >
                    {aboutHandyGo[currentAboutSection].subtitle}
                  </div>
                  <p
                    className={`text-base sm:text-lg lg:text-lg text-gray-600 transition-all duration-700 ease-out block ${textAnimating
                      ? "blur-lg opacity-0 transform translate-y-10"
                      : "blur-0 opacity-100 transform translate-y-0"
                      }`}
                  >
                    {aboutHandyGo[currentAboutSection].description}
                  </p>
                </div>
              </div>

              {/* Right Side - Scrolling Targets (images hidden on mobile, but container remains for scroll tracking) */}
              {/* On mobile: col-span-12. On desktop: md:col-span-7 */}
              <div className="col-span-12 md:col-span-7 space-y-[10vh] md:space-y-[20vh]">
                {aboutHandyGo.map((item, index) => (
                  <div
                    key={item.id}
                    ref={(el) => {
                      aboutSectionRefs.current[index] = el
                    }}
                    className="relative h-screen flex items-center justify-center"
                  >
                    {/* Desktop-only image */}
                    <div
                      className={`w-full bg-white rounded-2xl shadow-lg transition-all duration-700 ease-out hover:shadow-xl overflow-hidden transform hidden md:block ${index === currentAboutSection ? "scale-100 opacity-100" : "scale-95 opacity-50"
                        }`}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-[600px] object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sixth Section - Sponsors */}
        <div data-section="sponsors">
          <SixthSection />
        </div>

        {/* Seventh Section - System Features */}
        <div data-section="features">
          <SeventhSection />
        </div>

        {/* Eighth Section - Services */}
        <div data-section="services">
          <EighthSection onCardSelect={() => scrollToSection("get-started")} />
        </div>

        {/* Ninth Section - Join Now */}
        <div data-section="join">
          <NinthSection />
        </div>

        {/* Tenth Section - Call to Action */}
        <div data-section="get-started">
          <TenthSection navigateToLogin={navigateToLogin} />
        </div>
      </div>

      <style>{`
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  @keyframes fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  
  .fade-in {
    animation: fade-in 0.4s ease-out forwards;
  }
  
  .fade-out {
    animation: fade-out 0.4s ease-out forwards;
  }
  
  .contact-text {
    animation: fadeSlideUp 0.8s ease-out forwards;
  }
  
  .contact-heading {
    animation: fadeSlideUp 1s ease-out forwards;
  }
  
  .contact-details {
    animation: fadeSlideUp 1.2s ease-out forwards;
  }
  
  .fade-slide-up {
    animation: fadeSlideUp 0.8s ease-out forwards;
  }
  
  .delay-1 {
    animation-delay: 0.2s;
  }
  
  .delay-2 {
    animation-delay: 0.4s;
  }
  
  .delay-3 {
    animation-delay: 0.6s;
  }
  
  .delay-4 {
    animation-delay: 0.8s;
  }
  
  .delay-5 {
    animation-delay: 1s;
  }
  
  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
    </>
  )
}

export default Proposition