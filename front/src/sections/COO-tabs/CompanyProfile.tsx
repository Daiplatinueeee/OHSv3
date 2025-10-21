import axios from "axios"
import { useState, useEffect } from "react"
import { Dialog, DialogPanel } from "@headlessui/react"
import { MapPin, ChevronRight, BadgeCheck, ChevronLeft, ArrowLeft, ChevronDown, ChevronUp, Star } from "lucide-react"
import DirectBookingModal from "../Styles/DirectBookingModal"
import type { Booking, Service } from "../COO-tabs/bookings-data"

const keyframes = `@keyframes fadeIn {from { opacity: 0; } to { opacity: 1; }} @keyframes bounceIn {0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; }} @keyframes slideInUp {from { transform: translateY(20px); opacity: 0; } to { opacity: 1; }} @keyframes shakeX {0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } } 20%, 40%, 60%, 80% { transform: translateX(10px); } }} @keyframes countdown {from { width: 100%; } to { width: 0%; }} @keyframes pulse {0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }}`

export interface CompanyProfileProps {
  seller: {
    id: string | number
    name?: string
    firstName?: string
    lastName?: string
    middleName?: string
    username?: string
    businessName?: string
    profilePicture?: string | null
    totalRating: number
    totalReviews?: number
    reviews: number
    location: string
    startingRate: number
    ratePerKm: number
    badges: string[]
    description: string
    workerCount?: number
    estimatedTime?: string
    // Extended seller fields
    _id?: string
    email?: string
    mobileNumber?: string
    gender?: string
    coverPhoto?: string
    locationDetails?: {
      name: string
      lat: number
      lng: number
      distance: number
      zipCode?: string
    }
    accountType?: string
    status?: string
    isVerified?: boolean
    createdAt?: string
    secretQuestion?: string
    secretAnswer?: string
    secretCode?: string
    foundedDate?: string
    teamSize?: "1-5" | "6-10" | "11-25" | "26-50" | "51-100" | "101-500" | "500+"
    companyNumber?: string
    tinNumber?: string
    cityCoverage?: string[]
    aboutCompany?: string
    secRegistration?: string
    businessPermit?: string
    birRegistration?: string
    eccCertificate?: string
    generalLiability?: string
    workersComp?: string
    professionalIndemnity?: string
    propertyDamage?: string
    businessInterruption?: string
    bondingInsurance?: string
  }
  onBack: () => void
  onNavigateToBooking?: (service: Service, company: any) => void
}

export default function CompanyProfile({ seller, onBack, onNavigateToBooking }: CompanyProfileProps) {
  const [showNotification] = useState(true)
  const [, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("services")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [, setIsSuccessModalOpen] = useState(false)
  const [, setSuccessMessage] = useState("")

  const [services, setServices] = useState<Service[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [error] = useState<string | null>(null)

  const [completeUserData, setCompleteUserData] = useState<any>(null)
  const [, setUserDataLoading] = useState(true)

  const [isDirectBookingModalOpen, setIsDirectBookingModalOpen] = useState(false)
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null)
  const [expandedServices, setExpandedServices] = useState<{ [key: string]: boolean }>({})
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false)
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false)

  const imageFallback = "/placeholder.svg?height=200&width=300"

  const toggleServiceExpansion = (serviceId: string | number) => {
    const key = String(serviceId)
    setExpandedServices(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getSellerName = (seller: any) => {
    if (seller?.name) {
      return seller.name
    }
    if (seller?.username) {
      return seller.username
    }
    if (seller?.businessName) {
      return seller.businessName
    }

    const nameParts = []
    if (seller?.firstName) nameParts.push(seller.firstName)
    if (seller?.middleName) nameParts.push(seller.middleName)
    if (seller?.lastName) nameParts.push(seller.lastName)

    if (nameParts.length > 0) {
      const fullName = nameParts.join(" ")
      return fullName
    }

    return "Service Provider"
  }

  const getCoverPhoto = (seller: any) => {
    const userData = completeUserData || seller
    return userData?.coverPhoto
  }

  const getLocationName = (locationData: any) => {
    if (!locationData) return "Location not available"

    if (typeof locationData === "string") {
      return locationData
    }

    if (typeof locationData === "object" && locationData !== null) {
      return locationData.name || "Location not available"
    }

    return "Location not available"
  }

  const fetchCompleteUserData = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.warn("No authentication token found. Skipping complete user data fetch.")
        setUserDataLoading(false)
        return
      }

      const userId = seller._id || seller.id

      if (!userId) {
        console.warn("No user ID available to fetch complete data.")
        setUserDataLoading(false)
        return
      }

      const response = await axios.get("http://localhost:3000/api/accounts/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 200) {
        const data = response.data

        const targetUser = data.users.find((user: any) => {
          return user._id === userId || user._id === userId.toString()
        })

        if (targetUser) {
          setCompleteUserData(targetUser)
        } else {
          console.warn("User not found in the users list")
        }
      } else {
        console.error("Failed to fetch users:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching complete user data:", error)
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data)
      }
    } finally {
      setUserDataLoading(false)
    }
  }

  useEffect(() => {
    fetchCompleteUserData()
  }, [seller.id, seller._id])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          console.warn("No authentication token found. Skipping services fetch.")
          setServices([])
          return
        }

        const userId = seller._id || seller.id
        if (!userId) {
          console.warn("No seller ID found. Cannot fetch services.")
          setServices([])
          return
        }

        const response = await axios.get(`http://localhost:3000/api/services/company/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 200) {
          const data = response.data
          const fetchedServices: Service[] = data.services.map((s: any) => ({
            id: s._id,
            name: s.name,
            price: s.price,
            description: s.description,
            image: s.image || imageFallback,
            chargePerKm: s.chargePerKm,
            hasNotification: false,
            notificationCount: 0,
            cooId: s.cooId,
          }))

          setServices(fetchedServices)
        } else {
          console.error("Failed to fetch services:", response.status, response.statusText)
          const errorData = response.data
          setSuccessMessage(`Failed to load services: ${errorData.message || "Please try again."}`)
          setIsSuccessModalOpen(true)
        }
      } catch (error) {
        console.error("Network error fetching services:", error)
        setSuccessMessage("Network error: Could not connect to the server to fetch services.")
        setIsSuccessModalOpen(true)
      }
    }

    fetchServices()
  }, [seller._id, seller.id])


  const fetchBookings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.warn("No authentication token found. Skipping bookings fetch.")
        setBookings([])
        setLoading(false)
        return
      }

      const endpoint = ""

      console.log(`Making request to: ${endpoint}`)
      console.log(`With token: ${token ? "Token present" : "No token"}`)

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status !== 200) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again")
        } else if (response.status === 403) {
          throw new Error("Forbidden: Access denied")
        } else {
          throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`)
        }
      }

      const data = response.data
      console.log(`Received ${data.length} bookings`)
      setBookings(data)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        console.warn("User needs to log in again")
      }
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [activeTab])

  const getCurrentItems = () => {
    if (activeTab === "services") {
      const indexOfLastItem = currentPage * itemsPerPage
      const indexOfFirstItem = indexOfLastItem - itemsPerPage
      return services.slice(indexOfFirstItem, indexOfLastItem)
    } else {
      const indexOfLastItem = currentPage * itemsPerPage
      const indexOfFirstItem = indexOfLastItem - itemsPerPage
      return bookings.slice(indexOfFirstItem, indexOfLastItem)
    }
  }

  const getTotalPages = () => {
    if (activeTab === "services") {
      return Math.ceil(services.length / itemsPerPage)
    } else {
      return Math.ceil(bookings.length / itemsPerPage)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const filteredBookings = bookings

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const handleBookService = (service: Service) => {
    console.log("[v0] handleBookService called with service:", service)
    console.log("[v0] onNavigateToBooking callback exists:", !!onNavigateToBooking)

    if (onNavigateToBooking) {
      const displayData = completeUserData || seller
      console.log("[v0] Using onNavigateToBooking callback with displayData:", displayData)
      onNavigateToBooking(service, displayData)
    } else {
      console.log("[v0] Using DirectBookingModal instead of WorkersModal")
      console.log("[v0] Selected service for booking:", service)
      console.log("[v0] Complete user data:", completeUserData)
      console.log("[v0] Seller data:", seller)

      const displayData = completeUserData || seller
      console.log("[v0] Display data being used:", displayData)
      console.log("[v0] Display data ID:", displayData._id || displayData.id)
      console.log("[v0] Display data ID type:", typeof (displayData._id || displayData.id))

      setSelectedServiceForBooking(service)
      setIsDirectBookingModalOpen(true)
    }
  }

  const handleCloseDirectBookingModal = () => {
    console.log("[v0] Closing DirectBookingModal")
    setIsDirectBookingModalOpen(false)
    setSelectedServiceForBooking(null)
  }

  const createServiceDetails = () => {
    if (!selectedServiceForBooking) return null

    const displayData = completeUserData || seller
    console.log("[v0] createServiceDetails - displayData:", displayData)
    console.log("[v0] createServiceDetails - selectedServiceForBooking:", selectedServiceForBooking)

    const serviceDetails = {
      id: selectedServiceForBooking.id,
      name: selectedServiceForBooking.name,
      price: selectedServiceForBooking.price,
      category: "Service", // Default category
      image: selectedServiceForBooking.image,
      description: selectedServiceForBooking.description,
      chargePerKm: selectedServiceForBooking.chargePerKm,
      workersNeeded: displayData.workerCount || 1,
      estimatedTime: displayData.estimatedTime || "1-2 hours",
    }

    console.log("[v0] createServiceDetails result:", serviceDetails)
    return serviceDetails
  }

  const createCompanyData = () => {
    if (!selectedServiceForBooking) return null

    const displayData = completeUserData || seller
    console.log("[v0] createCompanyData - displayData:", displayData)

    const companyData = {
      id: displayData._id || displayData.id,
      _id: displayData._id || displayData.id,
      firstName: displayData.firstName || "",
      middleName: displayData.middleName,
      lastName: displayData.lastName || "",
      name: displayData.name || getSellerName(displayData),
      businessName: displayData.businessName || getSellerName(displayData),
      profilePicture: displayData.profilePicture,
      totalRating: displayData.totalRating || 0,
      reviews: displayData.reviews || 0,
      location: getLocationName(displayData?.locationDetails || displayData?.location),
      startingRate: displayData.startingRate || selectedServiceForBooking?.price || 0,
      ratePerKm: displayData.ratePerKm || selectedServiceForBooking?.chargePerKm || 0,
      badges: displayData.badges || ["Company"],
      description: displayData.description || displayData.aboutCompany || "",
      workerCount: displayData.workerCount || 1,
      estimatedTime: displayData.estimatedTime || "1-2 hours",
    }

    console.log("[v0] createCompanyData result:", companyData)
    return companyData
  }

  const renderTabContent = () => {
    if (activeTab === "services") {
      const currentServices = getCurrentItems() as Service[]
      const totalPages = getTotalPages()

      if (services.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-100/50 rounded-2xl border-1 border-gray-300">
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-medium text-gray-700 mb-2">No Services Available</h3>
              <p className="text-gray-600 mb-6">
                This company has not created any services yet. Please check back later.
              </p>
            </div>
          </div>
        )
      }

      return (
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentServices.map((service) => {
              const isExpanded = expandedServices[service.id]
              const isLongDescription = service.description && service.description.length > 100

              return (
                <div key={service.id} className="bg-gray-200/70 rounded-3xl p-6 relative flex flex-col">
                  {service.hasNotification && showNotification && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="relative">
                        <div className="absolute -top-1 -right-1 animate-ping h-6 w-6 rounded-full bg-red-400 opacity-75"></div>
                        <div className="relative bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {service.notificationCount}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img src={service.image || imageFallback} alt={service.name} className="w-full h-48 object-cover" />
                  </div>
                  <h3 className="text-xl font-light mb-2">{service.name}</h3>
                  <div className="mb-4 flex-grow">
                    <p className={`text-gray-600 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {service.description}
                    </p>
                    {isLongDescription && (
                      <button
                        onClick={() => toggleServiceExpansion(service.id)}
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-700 text-sm font-medium mt-2 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Starting Rate:</span>
                      <span className="text-lg font-medium">₱{service.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Per KM Charge:</span>
                      <span className="text-base">₱{service.chargePerKm.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <button
                        onClick={() => handleBookService(service)}
                        className="w-full px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors shadow-sm hover:shadow-md font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${currentPage === page ? "bg-sky-500 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )
    } else if (activeTab === "active" || activeTab === "pending" || activeTab === "completed") {
      const currentBookings = getCurrentItems() as Booking[]
      const totalPages = getTotalPages()

      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-100/50 rounded-2xl">
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-medium text-gray-700 mb-2">Loading...</h3>
              <p className="text-gray-600">Fetching your bookings...</p>
            </div>
          </div>
        )
      }

      if (error) {
        return (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50 rounded-2xl">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        )
      }

      if (filteredBookings.length === 0) {
        const token = localStorage.getItem("token")
        const emptyMessage = !token ? "Login Required" : "No Bookings Found"
        const emptyDescription = !token
          ? "Please log in to view booking information for this company."
          : "This company has no bookings in this category yet."

        return (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-100/50 rounded-2xl">
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-medium text-gray-700 mb-2">{emptyMessage}</h3>
              <p className="text-gray-600 mb-6">{emptyDescription}</p>
            </div>
          </div>
        )
      }

      return (
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentBookings.map((booking) => (
              <div key={booking._id || booking._id} className="bg-gray-200/70 rounded-3xl p-6 flex flex-col h-[450px]">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={booking.image || imageFallback}
                    alt={booking.serviceName}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <h3 className="text-xl font-light mb-2">{booking.serviceName}</h3>
                <div className="space-y-2 flex-grow">
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Customer:</span> {booking.customerName}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()},{" "}
                    {booking.time}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Location:</span> {getLocationName(booking.location)}
                  </p>
                  {activeTab === "active" && booking.paymentMethod && (
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Payment Method:</span> {booking.paymentMethod}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <div className="text-lg font-medium">₱{booking.total.toLocaleString()}</div>
                  <button
                    onClick={() => handleBookingClick(booking)}
                    className="text-sky-500 hover:text-sky-600 flex items-center gap-1 group"
                  >
                    Details
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${currentPage === page ? "bg-sky-500 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )
    }
  }

  const displayData = completeUserData || seller

  const handleOpenReviewsModal = () => {
    setIsReviewsModalOpen(true)
    setTimeout(() => setReviewsModalVisible(true), 50)
    document.body.style.overflow = "hidden"
  }

  const handleCloseReviewsModal = () => {
    setReviewsModalVisible(false)
    setTimeout(() => {
      setIsReviewsModalOpen(false)
      document.body.style.overflow = "auto"
    }, 300)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      <style>{keyframes}</style>

      <div className="max-w-7xl mx-auto">
        <div className="relative h-80 overflow-hidden rounded-b-3xl">
          <img
            src={getCoverPhoto(displayData) || "/placeholder.svg?height=320&width=1200&query=company cover photo"}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/company-cover-photo.jpg"
            }}
          />
        </div>

        <div className="relative px-4 pb-8">
          <div className="absolute -top-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img
                  src={displayData?.profilePicture || "/placeholder.svg?height=128&width=128&query=profile picture"}
                  alt={getSellerName(displayData)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/diverse-group-profile.png"
                  }}
                />
                {displayData?.isVerified && (
                  <div className="absolute -bottom-[-5px] -right-[-8px] flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
                    <BadgeCheck className="h-10 w-10" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-normal text-gray-900">{getSellerName(displayData)}</h1>
                  <div
                    onClick={handleOpenReviewsModal}
                    className="flex cursor-pointer bg-white justify-center items-center gap-1 px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-yellow-500 text-[17px]">
                      {"★".repeat(seller.totalRating)}
                      {"☆".repeat(5 - seller.totalRating)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {seller.totalRating.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({displayData?.totalReviews || displayData?.reviews || 0} reviews)
                    </span>
                    <ChevronRight size={16} color="gray" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{getLocationName(displayData?.locationDetails || displayData?.location)}</span>
                </div>
              </div>
              <div>
                <button
                  onClick={onBack}
                  className="flex items-center text-sky-600 hover:text-sky-700 transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Preview
                </button>
              </div>
            </div>

            <p className="text-gray-600 max-w-2xl">
              {displayData?.aboutCompany || displayData?.description || "No description available"}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab("services")}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center gap-2 ${activeTab === "services"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Services
              </button>
            </nav>
          </div>
        </div>

        <div className="px-4 py-8 mb-20">{renderTabContent()}</div>
      </div>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />
        <DialogPanel className="fixed inset-0 flex items-center justify-center p-4">
          {/* Modal content goes here */}
        </DialogPanel>
      </Dialog>

      {selectedServiceForBooking && (
        <DirectBookingModal
          isOpen={isDirectBookingModalOpen}
          onClose={handleCloseDirectBookingModal}
          serviceDetails={createServiceDetails()}
          companyData={createCompanyData()}
        />
      )}

      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
            style={{ opacity: reviewsModalVisible ? 1 : 0 }}
            onClick={handleCloseReviewsModal}
          />

          <div
            className="relative bg-white w-full h-full flex flex-col transition-all duration-500 transform"
            style={{
              opacity: reviewsModalVisible ? 1 : 0,
              transform: reviewsModalVisible ? "scale(1)" : "scale(0.98)",
            }}
          >

            <div className="flex flex-col items-center justify-center py-8 border-b border-gray-200">
              <h1 className="text-3xl font-medium text-gray-700">
                Ratings & Reviews
              </h1>
              <p className="text-gray-500 mt-2">
                {getSellerName(displayData)}'s customer feedback
              </p>
            </div>

            <div className="flex flex-1 overflow-hidden ml-5">
              <div className="w-80 bg-white overflow-y-auto p-6 ">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6">
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-gray-800 mb-2">
                        {displayData?.averageRating?.toFixed(1) || seller.totalRating.toFixed(1) || "0.0"}
                      </div>
                      <div className="flex justify-center mb-2">
                        {renderStars(Math.round(displayData?.averageRating || seller.totalRating || 0))}
                      </div>
                      <p className="text-gray-500 text-sm">
                        Based on {displayData?.totalReviews || displayData?.ratings?.length || 0} reviews
                      </p>
                    </div>

                    <div className="space-y-2 mt-4">
                      {[5, 4, 3, 2, 1].map((starCount) => {
                        const count = displayData?.ratings?.filter((r: any) => r.rating === starCount).length || 0
                        const total = displayData?.ratings?.length || 1
                        const percentage = Math.round((count / total) * 100)

                        return (
                          <div key={starCount} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-6">{starCount}</span>
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 flex flex-col text-center">
                    <h3 className="font-medium text-gray-800 mb-5">Review Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Reviews:</span>
                        <span className="font-medium">{displayData?.totalReviews || displayData?.ratings?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Rating:</span>
                        <span className="font-medium">{displayData?.averageRating?.toFixed(1) || seller.totalRating.toFixed(1) || "0.0"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-12 py-8">
                  <div className="max-w-4xl">
                    {!displayData?.ratings || displayData.ratings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-gray-400 mb-4">
                          <Star size={48} />
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-500">This company hasn't received any reviews yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {displayData.ratings.map((rating: any, index: number) => (
                          <div
                            key={rating._id || index}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            style={{
                              animation: "fadeIn 0.4s ease-in-out",
                              animationDelay: `${index * 0.05}s`,
                              animationFillMode: "both"
                            }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                {rating.customerId?.profilePicture ? (
                                  <img
                                    src={rating.customerId.profilePicture || "/placeholder.svg"}
                                    alt={rating.customerName}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg"
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 text-lg font-medium bg-gray-100">
                                    {rating.customerName?.charAt(0)?.toUpperCase() || "?"}
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-medium text-gray-800">{rating.customerName}</h4>
                                  <p className="text-sm text-gray-500">
                                    {new Date(rating.reviewDate).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric"
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {renderStars(rating.rating)}
                                {rating.serviceType && (
                                  <span className="mt-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {rating.serviceType}
                                  </span>
                                )}
                              </div>
                            </div>

                            {rating.review && (
                              <div className="mt-3">
                                <p className="text-gray-700 leading-relaxed">{rating.review}</p>
                              </div>
                            )}
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => (rating)}
                                className="px-4 py-1.5 rounded-full border border-red-400 text-red-500 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                Report
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-12 py-6 bg-white">
                  <div className="flex justify-end max-w-4xl">
                    <button
                      onClick={handleCloseReviewsModal}
                      className="px-8 py-2.5 rounded-full font-medium transition-all cursor-pointer bg-sky-500 text-white hover:bg-sky-600 shadow-sm hover:shadow-md"
                    >
                      Close
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}