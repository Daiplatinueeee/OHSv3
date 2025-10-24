import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Search, X, ChevronDown, ChevronUp } from "lucide-react"
import Footer from "../sections/Styles/Footer"
import WorkersModal from "../sections/Styles/WorkersModal"
import MyFloatingDockCustomer from "../sections/Styles/MyFloatingDock-Customer"
import ServiceCategoriesModal from "../sections/Styles/ServiceCategoriesModal"
import ServiceBanner from "./Styles/ServiceBanner"
import ServiceBanner2 from "./Styles/ServiceBanner2"
import ServiceBanner3 from "./Styles/ServiceBanner3"
import LegalText from "../sections/Styles/LegalText"
// import MoreFeatures from "../sections/Styles/HomeComponents/MoreFeatures"
import Welcome from "../sections/Styles/HomeComponents/Welcome"
import Popular from "../sections/Styles/HomeComponents/Popular"
import BestCompanies from "./Styles/HomeComponents/BestCompanies"
import { InfiniteSlider } from "./Styles/HomeComponents/InfiniteSlider"
import { ProgressiveBlur } from "./Styles/HomeComponents/ProgressiveBlur"
import {
  serviceSubcategories as staticServiceSubcategories,
  sellers,
  products as staticProducts,
} from "../sections/Home-data"
import SuggestServiceModal from "../sections/Styles/SuggestServiceModal"
import { io } from "socket.io-client"

import image1 from "@/assets/Home/futniture.jpg"
import image2 from "@/assets/Home/barber.jpg"
import image3 from "@/assets/Home/dec7.jpg"

interface BackendService {
  id: string
  name: string
  price: number
  description: string
  image: string
  chargePerKm: number
  mainCategory: string
  subCategory: string
  cooId: {
    _id: string
    firstName: string
    middleName?: string
    lastName: string
    profilePicture: string | null
    location?: { name: string }
  } | null
  totalRating: number
  totalReviews: number
  workersNeeded: number
  estimatedTime: string
}

interface DisplayProduct {
  id: string | number
  name: string
  price: number
  category: string
  image: string
  description: string
  totalRating?: number
  totalReviews?: number
  workersNeeded?: number
  cooId?: BackendService["cooId"]
  chargePerKm?: number
}

interface CombinedServiceSubcategories {
  [key: string]: {
    id: number | string
    name: string
    description: string
    price: number
    image: string
    workerCount: number
    estimatedTime: string
    category: string
    cooId?: BackendService["cooId"]
    totalRating?: number
    totalReviews?: number
    workersNeeded?: number
    chargePerKm?: number
  }[]
}

const staticSlides = [
  {
    title: "Furniture Moving",
    subtitle: "Barangay San Isidro offers reliable furniture moving services",
    image: image1,
  },
  {
    title: "Barber Services",
    subtitle: "Manila barber shop located in harewood road bishopdale",
    image: image2,
  },
  {
    title: "Contsruction & Renovation",
    subtitle: "Barangay Maligaya construction services now available!",
    image: image3,
  },
]

function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showAllServices, setShowAllServices] = useState(false)
  const [, setShowWelcomeModal] = useState(false)
  const [isSuggestServiceModalOpen, setIsSuggestServiceModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [, setDynamicServices] = useState<BackendService[]>([])
  const [combinedProducts, setCombinedProducts] = useState<DisplayProduct[]>([])
  const [combinedServiceSubcategories, setCombinedServiceSubcategories] =
    useState<CombinedServiceSubcategories>(staticServiceSubcategories)

  const [slides, setSlides] = useState(staticSlides)
  const [current, setCurrent] = useState(0)

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1)
  }

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1)
  }

  const navigate = useNavigate()


  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [isHovered])

  useEffect(() => {
    const hasSeenWelcomeModal = localStorage.getItem("hasSeenWelcomeModal")
    if (!hasSeenWelcomeModal) {
      setShowWelcomeModal(true)
    }
  }, [])

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:3000/api/advertisements", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.advertisements.length > 0) {
            const dynamicSlides = data.advertisements.map((ad: any) => ({
              title: ad.userName,
              subtitle: ad.description,
              image: ad.bannerImage,
            }))
            setSlides([...staticSlides, ...dynamicSlides])
          }
        }
      } catch (error) {
        console.error("Error fetching advertisements:", error)
      }
    }

    fetchAdvertisements()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token") // Assuming the token is stored in localStorage
    if (!token) {
      navigate("/proposition")
    }
  }, [])

  // Function to fetch and combine services (now callable by WebSocket event)
  const fetchAndCombineServices = async () => {
    try {
      console.log("Home.tsx: Attempting to fetch services from backend...")
      const response = await fetch("http://localhost:3000/api/services")

      if (response.ok) {
        const data = await response.json()
        console.log("Home.tsx: Raw services fetched successfully:", data.services)

        setDynamicServices(data.services)

        const tempCombinedProducts: DisplayProduct[] = [...staticProducts]
        const tempCombinedSubcategories: CombinedServiceSubcategories = {}
        Object.keys(staticServiceSubcategories).forEach((key) => {
          const typedKey = key as keyof typeof staticServiceSubcategories;
          tempCombinedSubcategories[typedKey] = [...staticServiceSubcategories[typedKey]]
        })

        data.services.forEach((service: BackendService) => {
          console.log(
            "Home.tsx: Processing dynamic service:",
            service.name,
            "Main Category:",
            service.mainCategory,
            "Sub Category:",
            service.subCategory,
            "Service ID:",
            service.id,
            "COO ID:",
            service.cooId?._id,
            "Charge Per KM:",
            service.chargePerKm,
          )

          const existingProduct = tempCombinedProducts.find((p) => p.name === service.mainCategory)
          if (!existingProduct && service.mainCategory !== "Suggest a Service") {
            console.log("Home.tsx: Creating new main category product:", service.mainCategory)
            tempCombinedProducts.push({
              id: service.id,
              name: service.mainCategory,
              price: service.price,
              category: service.mainCategory,
              image: service.image || "/placeholder.svg?height=48&width=48",
              description: `Explore services related to ${service.mainCategory}.`,
              cooId: service.cooId,
              totalRating: service.totalRating,
              totalReviews: service.totalReviews,
              workersNeeded: service.workersNeeded,
              chargePerKm: service.chargePerKm,
            })
          }

          if (!tempCombinedSubcategories[service.mainCategory]) {
            console.log("Home.tsx: Creating new subcategory array for main category:", service.mainCategory)
            tempCombinedSubcategories[service.mainCategory] = []
          }

          const subcategoryExists = tempCombinedSubcategories[service.mainCategory].some((sub) => sub.id === service.id)

          if (!subcategoryExists) {
            const subcategoryId = service.id || Date.now().toString()
            console.log(
              "Home.tsx: Adding new subcategory:",
              service.subCategory,
              "to main category:",
              service.mainCategory,
            )

            tempCombinedSubcategories[service.mainCategory].push({
              id: subcategoryId,
              name: service.subCategory,
              description: service.description,
              price: service.price,
              image: service.image || "/placeholder.svg?height=48&width=48",
              workerCount: service.workersNeeded || 1,
              estimatedTime: service.estimatedTime || "Varies",
              cooId: service.cooId,
              category: service.mainCategory,
              totalRating: service.totalRating,
              totalReviews: service.totalReviews,
              workersNeeded: service.workersNeeded,
              chargePerKm: service.chargePerKm,
            })
          } else {
            console.log(
              "Home.tsx: Subcategory already exists:",
              service.subCategory,
              "in main category:",
              service.mainCategory,
            )
          }
        })

        console.log(
          "Home.tsx: Final combined products:",
          tempCombinedProducts.map((p) => p.name),
        )
        console.log("Home.tsx: Final combined subcategories:", Object.keys(tempCombinedSubcategories))

        const suggestServiceIndex = tempCombinedProducts.findIndex((p) => p.name === "Suggest a Service")
        if (suggestServiceIndex !== -1) {
          const suggestService = tempCombinedProducts.splice(suggestServiceIndex, 1)[0]
          tempCombinedProducts.push(suggestService)
        } else {
          tempCombinedProducts.push({
            id: "suggest-service",
            name: "Suggest a Service",
            price: 0,
            category: "Community",
            image: "/placeholder.svg?height=48&width=48",
            description: "Can't find what you're looking for? Suggest a new service and help us grow our offerings!",
          })
        }

        setCombinedProducts(tempCombinedProducts)
        setCombinedServiceSubcategories(tempCombinedSubcategories)
      } else {
        console.error("Home.tsx: Failed to fetch dynamic services:", response.status, response.statusText)
        const errorData = await response.json()
        console.error("Home.tsx: Error details:", errorData)
      }
    } catch (error) {
      console.error("Home.tsx: Network error fetching dynamic services:", error)
    }
  }

  // NEW: WebSocket connection and listener with authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userString = localStorage.getItem("user")
    let userId = null
    let username = "Guest"

    if (userString) {
      try {
        const userData = JSON.parse(userString)
        // Assuming user data might be nested or direct
        userId = userData.user?._id || userData._id || userData.id
        username = userData.user?.firstName || userData.firstName || "User" // Use first name for username
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e)
      }
    }

    console.log("Home.tsx: Attempting to connect to Socket.IO with token and user info:", {
      token: token ? "present" : "missing",
      userId,
      username,
    })

    const socket = io("http://localhost:3000", {
      auth: {
        token: token,
        userId: userId,
        username: username,
      },
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      console.log("Home.tsx: Connected to Socket.IO server for service updates. Socket ID:", socket.id)
      fetchAndCombineServices()
    })

    socket.on("disconnect", (reason) => {
      console.log("Home.tsx: Disconnected from Socket.IO server for service updates. Reason:", reason)
    })

    socket.on("connect_error", (err) => {
      console.error("Home.tsx: Socket.IO connection error:", err.message)
      if (err.message === "Authentication failed" || err.message === "Authentication token is required") {
        console.error("Home.tsx: Authentication error with WebSocket. Redirecting to login.")
        // Optionally redirect to login if authentication fails
        navigate("/login");
      }
    })

    // Listen for service_update event from the backend
    socket.on("service_update", (data) => {
      console.log("Home.tsx: Received service_update via WebSocket:", data)
      // When an update is received, re-fetch all services
      fetchAndCombineServices()
    })

    // Clean up the socket connection when the component unmounts
    return () => {
      console.log("Home.tsx: Disconnecting Socket.IO client.")
      socket.disconnect()
    }
  }, []) // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const categories = Array.from(new Set(combinedProducts.map((product) => product.category)))

  const filteredProducts = combinedProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
    return matchesSearch && matchesPrice && matchesCategory
  })

  const displayedProducts = showAllServices ? filteredProducts : filteredProducts.slice(0, 8)

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const handlePriceChange = (value: number, index: number) => {
    setPriceRange((prev) => {
      const newRange = [...prev]
      newRange[index] = value
      return newRange as [number, number]
    })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 50000])
    setSelectedCategories([])
  }

  const handleSeeMore = (product: DisplayProduct) => {
    console.log("Home.tsx: handleSeeMore - Selected product:", product)
    if (product.name === "Suggest a Service") {
      setIsSuggestServiceModalOpen(true)
    } else if (combinedServiceSubcategories[product.name as keyof typeof combinedServiceSubcategories]) {
      setSelectedCategory(product.name)
      setIsCategoriesModalOpen(true)
    } else {
      setSelectedProduct(product)
      setIsModalOpen(true)
    }
  }

  const handleSubcategorySelect = (subcategory: CombinedServiceSubcategories[string][number]) => {
    console.log("Home.tsx: handleSubcategorySelect - Selected subcategory:", subcategory)
    setSelectedCategory(subcategory.name)
    setIsCategoriesModalOpen(false)
    setSelectedProduct(subcategory) // This will correctly pass the cooId and chargePerKm
    setIsModalOpen(true)
  }

  const toggleShowAllServices = () => {
    setShowAllServices((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-white/90 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="z-40 flex">
        <MyFloatingDockCustomer />
      </div>

      <Welcome />

      {/* Carousel */}
      <div
        className="relative flex justify-center mt-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex justify-center items-center overflow-hidden w-[85rem] max-w-full h-120 md:h-[calc(100vh-106px)] bg-white rounded-2xl dark:bg-neutral-800">
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 h-120 md:h-[calc(100vh-106px)] bg-cover bg-center bg-no-repeat flex flex-col"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="mt-auto w-2/3 md:max-w-lg ps-5 pb-5 md:ps-10 md:pb-10">
                  <span className="block text-white">{slide.title}</span>
                  <span className="block text-white text-xl md:text-3xl mt-2">{slide.subtitle}</span>
                  <div className="mt-5">
                    <button
                      onClick={() => {
                        const section = document.getElementById("services-section")
                        if (section) {
                          section.scrollIntoView({ behavior: "smooth" })
                        }
                      }}
                      className="py-2 px-8 inline-flex items-center gap-x-2 text-sm font-medium rounded-full bg-white text-black hover:bg-gray-100 focus:outline-none"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-0 bottom-0 left-4 md:left-8 lg:left-[calc((100%-85rem)/2)] flex justify-center items-center w-12 h-full text-black hover:bg-white/20 rounded-s-2xl focus:outline-none"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-0 bottom-0 right-4 md:right-8 lg:right-[calc((100%-85rem)/2)] flex justify-center items-center w-12 h-full text-black hover:bg-white/20 rounded-e-2xl focus:outline-none"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Infinite Slider of Company Logos */}
      <section className="bg-background pb-16 md:pb-32 mt-10">
        <div className="group relative m-auto max-w-7xl px-6">
          <div className="flex flex-col items-center md:flex-row">
            <div className="md:max-w-44 md:border-r md:pr-6">
              <p className="text-end text-[18px] font-medium text-gray-700">Powering the best teams</p>
            </div>
            <div className="relative py-6 md:w-[calc(100%-11rem)]">
              <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                    alt="Nvidia Logo"
                    height="14"
                    width="auto"
                  />
                </div>

                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/column.svg"
                    alt="Column Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/github.svg"
                    alt="GitHub Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/nike.svg"
                    alt="Nike Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                    alt="Lemon Squeezy Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                    alt="Laravel Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/lilly.svg"
                    alt="Lilly Logo"
                    height="28"
                    width="auto"
                  />
                </div>

                <div className="flex">
                  <img
                    className="mx-auto h-10 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/openai.svg"
                    alt="OpenAI Logo"
                    height="24"
                    width="auto"
                  />
                </div>
              </InfiniteSlider>

              <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
              <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
              <ProgressiveBlur
                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        </div>
      </section>

      <Popular />

      <ServiceBanner />

      {/* List of all services */}
      <div className="bg-white/90 text-black py-16" id="services-section">
        {" "}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-medium text-gray-700">
                List of all <span className="text-sky-500 text-[40px] ml-1">Services</span>
              </h2>
              <p className="text-sm text-gray-500">
                Showing {displayedProducts.length} of {filteredProducts.length} services
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center bg-gray-200/70 p-4 rounded-lg">
              <div className="relative flex-grow w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-center text-gray-700">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                  className="w-24 px-3 py-2 bg-white rounded-full text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                  className="w-24 px-3 py-2 bg-white rounded-full text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center text-gray-700">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategories.includes(category)
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black hover:bg-gray-300 cursor-pointer"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {(searchQuery || priceRange[0] > 0 || priceRange[1] < 50000 || selectedCategories.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all w-full sm:w-auto justify-center"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayedProducts.map((product) => (
                <div
                  key={product.id.toString()} // Ensure key is always a string
                  className="group cursor-pointer bg-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-cover transform transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-grow">{product.description}</p>{" "}
                  {/* Removed mb-16, added flex-grow */}
                  <div className="mt-auto flex justify-between items-center pt-4">
                    {" "}
                    {/* Added mt-auto, pt-4 */}
                    <span className="text-lg font-medium text-gray-900">₱{product.price}</span>
                    <button
                      onClick={() => handleSeeMore(product)}
                      className="text-sky-500 flex items-center transition-all duration-300 hover:text-blue-600 hover:translate-x-1"
                    >
                      See More <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length > 8 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={toggleShowAllServices}
                  className="text-sky-500 flex items-center transition-all duration-300 hover:text-blue-600 hover:translate-x-1"
                >
                  {showAllServices ? (
                    <>
                      Show Less <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Show More Services <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ServiceBanner2 />

      <BestCompanies />

      <ServiceBanner3 />

      <ServiceCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categoryName={selectedCategory}
        subcategories={
          combinedServiceSubcategories[selectedCategory as keyof typeof combinedServiceSubcategories] || []
        }
        onSelectSubcategory={handleSubcategorySelect}
      />

      <WorkersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceDetails={selectedProduct}
        staticSellers={sellers}
      />

      <SuggestServiceModal isOpen={isSuggestServiceModalOpen} onClose={() => setIsSuggestServiceModalOpen(false)} />

      <LegalText />

      <Footer />
    </div>
  )
}

export default Home