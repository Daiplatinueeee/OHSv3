import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  MessageCircleMore,
  Bell,
  User,
  Bookmark,
  Search,
  Calendar,
  Clock,
  X,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  XCircleIcon,
  Coffee,
  CheckSquare,
  Star,
  Users,
  FileText,
  PowerOff,
  Album,
  ArrowUpRight,
  Ticket,
  MapPin,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import ProviderTrackingMap from "./ProviderTrackingMap"
import NotificationPopup, { type NotificationItem } from "../Customer_Tabs/Notification"
import CompanyPreview from "./CompanyPreview"
import LocationSelectionModal from "./LocationSelectionModal.tsx"
import ReportModal from "./ReportModal"
import axios from "axios"

const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number; name: string } | null> => {
  try {
    const encodedAddress = encodeURIComponent(address)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "ServiceBookingApp/1.0",
      },
    })

    if (!response.ok) {
      console.error("Geocoding API failed with status:", response.status)
      return null
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      console.error("No results found for address:", address)
      return null
    }

    const result = data[0]
    return {
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
      name: result.display_name,
    }
  } catch (error) {
    console.error("Error in geocoding:", error)
    return null
  }
}

interface DockItemProps {
  icon: React.ReactNode
  to: string
  isActive: boolean
  onClick?: () => void
  badge?: number
}

const DockItem: React.FC<DockItemProps> = ({ icon, to, isActive, onClick, badge }) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate() // Use useNavigate for programmatic navigation

  const handleClick = async () => {
    if (onClick) {
      onClick()
    } else if (to === "/logout") {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          await axios.post(
            "http://localhost:3000/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        }
      } catch (error) {
        console.error("Error logging out:", error)
      } finally {
        localStorage.removeItem("token")
        navigate("/login")
      }
    } else if (to === "/profile") {
      navigate("/customer/profile")
    } else if (to === "/") {
      navigate("/")
    } else {
      console.log(`Navigate to: ${to}`)
    }
  }

  const commonProps = {
    className: `relative flex items-center justify-center w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out hover:scale-110`,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }

  const content = (
    <>
      <div
        className={`flex items-center justify-center transition-all duration-200 ${isActive ? "text-primary" : isHovered ? "text-primary/80" : "text-gray-400"
          }`}
      >
        {to === "/notification" ? (
          <motion.div
            animate={
              badge !== undefined && badge > 0
                ? {
                  scale: [1, 1.1, 1, 1.1, 1],
                  rotate: [0, -5, 5, -5, 5, 0],
                }
                : {}
            }
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: badge !== undefined && badge > 0 ? Number.POSITIVE_INFINITY : 0,
              repeatDelay: 2,
            }}
            className="relative"
          >
            {icon}
            {badge !== undefined && badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full ring-1 ring-white"
                style={{ transform: "translate(30%, -30%)" }}
              />
            )}
          </motion.div>
        ) : (
          icon
        )}
      </div>

      {/* Label with animation */}
      <div
        className={`absolute -top-8 bg-sky-400 text-white text-xs px-2 py-1 rounded-md opacity-0 transition-all duration-200 ${isHovered ? "opacity-100 transform translate-y-0" : "transform translate-y-2"
          }`}
      >
        {to === "/"
          ? "Home"
          : to === "#" && onClick
            ? "Bookings"
            : to === "/notification"
              ? "Notifications"
              : to === "/profile"
                ? "Profile"
                : to === "/chat"
                  ? "Chats"
                  : to === "/coupons" // Added case for coupons
                    ? "Coupons"
                    : to}
      </div>
    </>
  )

  // If it's an action button (has onClick or is a special internal link like # or /notification)
  // or if it's a logout/profile/home link that needs custom logic before navigation, use a div with onClick.
  // Otherwise, use react-router-dom's Link component.
  if (
    onClick ||
    to === "#" ||
    to === "/notification" ||
    to === "/logout" ||
    to === "/profile" ||
    to === "/" ||
    to === "/coupons"
  ) {
    return (
      <div {...commonProps} onClick={handleClick}>
        {content}
      </div>
    )
  } else {
    return (
      <Link to={to} {...commonProps}>
        {content}
      </Link>
    )
  }
}

interface StatCardProps {
  title: string
  count: number
  icon: React.ReactNode
  trend?: string
  trendValue?: number
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, trend, trendValue }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      {trend && trendValue && (
        <div
          className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
        >
          {trend === "up" ? "+" : "-"}
          {trendValue}%
          {trend === "up" ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold mt-4">{count}</h3>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
  </div>
)

interface Booking {
  _id: string // This is the actual MongoDB _id
  userId: string
  firstname: string
  productName: string
  serviceImage?: string
  providerName: string
  providerId: string
  workerCount: number
  bookingDate: string
  bookingTime: string
  location: {
    name: string
    lat: number
    lng: number
    distance: number
  }
  estimatedTime?: string
  pricing: {
    baseRate: number
    distanceCharge: number
    totalRate: number
  }
  status: string
  createdAt: string
  providerAccepted?: boolean
  // Legacy fields for compatibility - these should ideally be phased out
  companyName?: string
  service?: string
  date?: string
  price?: number
  image?: string
  paymentComplete?: boolean
  providerArrived?: boolean
  serviceType?: string
  ratePerKm?: number
  additionalFees?: number
  baseRate?: number
  workersFilled?: boolean
  customerConfirmation?: boolean // Added for customer confirmation status
  serviceComplete?: boolean // Added for service completion status
  averageRating?: number
  totalReviews?: number
  profilePicture?: string
}

interface Coupon {
  _id: string
  userId: string
  companyId: string
  companyName?: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  maxDiscount?: number
  minBookingAmount?: number
  expiresAt: string
  isUsed: boolean
  usedAt?: string
  createdAt: string
  minPurchase: string
}

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState<number>(30) // Existing timer state, initialized to 30
  const timerRef = useRef<NodeJS.Timeout | null>(null) // Ref to hold the timer ID
  const [status, setStatus] = useState(booking.status)
  const [paymentComplete] = useState(booking.paymentComplete || false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [, setIsLoadingMap] = useState(false)
  const [providerArrived, setProviderArrived] = useState(booking.providerArrived || false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [reviewRating, setReviewRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showBookAgainModal, setShowBookAgainModal] = useState(false)
  const [rebookDate, setRebookDate] = useState("")
  const [rebookTime, setRebookTime] = useState("")
  const [useSameLocation, setUseSameLocation] = useState(true)
  const [newLocation, setNewLocation] = useState({ name: "", lat: 0, lng: 0, distance: 0 })
  const [isSubmittingRebook, setIsSubmittingRebook] = useState(false)
  const [showRebookSuccessModal, setShowRebookSuccessModal] = useState(false)
  const [showRebookErrorModal, setShowRebookErrorModal] = useState(false)
  const [rebookErrorMessage, setRebookErrorMessage] = useState("")
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [providerLocationCoords, setProviderLocationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [customerCurrentLocation, setCustomerCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [, setBooking] = useState(booking) // State to update booking locally
  const [showCancelWarningModal, setShowCancelWarningModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")
  const [, setShowReportSuccessModal] = useState(false)

  const customerLocation = booking.location
    ? {
      lat: booking.location.lat,
      lng: booking.location.lng,
    }
    : { lat: 14.5995, lng: 120.9842 } // Fallback to Manila coordinates

  // Convert database booking to display format
  const displayBooking = {
    id: booking._id, // Use the actual MongoDB _id as the primary identifier
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    companyName: booking.companyName || booking.providerName,
    service: booking.service || booking.productName,
    serviceType: booking.serviceType || "",
    status: booking.status,
    date: booking.date || new Date(booking.bookingDate).toLocaleDateString(),
    price: booking.price || booking.pricing.totalRate,
    image: booking.image || booking.serviceImage || "/placeholder.svg",
    workerCount: booking.workerCount,
    estimatedTime: booking.estimatedTime || "2-4 hours",
    location: booking.location.name,
    distance: booking.location.distance,
    baseRate: booking.baseRate || booking.pricing.baseRate,
    ratePerKm: booking.ratePerKm || booking.pricing.distanceCharge / booking.location.distance || 20,
    additionalFees: booking.additionalFees || 0,
    paymentComplete: booking.paymentComplete || false,
    providerArrived: booking.providerArrived || false,
    providerAccepted: booking.providerAccepted || false,
    workersFilled: booking.workersFilled || false,
    customerConfirmation: booking.customerConfirmation || false, // Include customerConfirmation
    serviceComplete: booking.serviceComplete || false, // Include serviceComplete
    rating: booking.totalReviews || 0,
  }

  // Function to check if cancellation is allowed (3 days before booking date)
  const canCancelBooking = () => {
    if (!displayBooking.bookingDate) return true // Allow cancel if no booking date set

    const bookingDate = new Date(displayBooking.bookingDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    bookingDate.setHours(0, 0, 0, 0)

    const diffTime = bookingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays >= 3
  }

  // Function to handle cancel button click with validation
  const handleCancelClick = () => {
    if (canCancelBooking()) {
      handleCancelBooking(displayBooking.id)
    } else {
      setShowCancelWarningModal(true)
    }
  }

  // Function to handle booking cancellation via API
  const handleCancelBooking = async (bookingIdToCancel: string) => {
    console.log(`Booking ${bookingIdToCancel} timed out. Cancelling...`)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token not found for cancellation.")
        setStatus("cancelled") // Fallback to local update
        localStorage.setItem(
          "bookingStatusUpdate",
          JSON.stringify({ id: bookingIdToCancel, status: "cancelled", timestamp: new Date().getTime() }),
        )
        return
      }

      const response = await fetch(`http://localhost:3000/api/bookings/${bookingIdToCancel}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update booking status to cancelled on backend.")
      }

      const updatedBooking = await response.json()
      console.log("Booking cancelled successfully due to timeout:", updatedBooking)
      setStatus("cancelled") // Update local state
      // Inform parent component (FloatingDock) about the change
      localStorage.setItem(
        "bookingStatusUpdate",
        JSON.stringify({ id: bookingIdToCancel, status: "cancelled", timestamp: new Date().getTime() }),
      )
    } catch (error) {
      console.error("Error cancelling booking via API:", error)
      setStatus("cancelled") // Fallback to local update
      localStorage.setItem(
        "bookingStatusUpdate",
        JSON.stringify({ id: bookingIdToCancel, status: "cancelled", timestamp: new Date().getTime() }),
      )
    }
  }

  // Existing useEffect for timer, modified to call API
  useEffect(() => {
    // Clear any existing timer when dependencies change or component unmounts
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Only start timer if status is "ongoing" AND payment is NOT complete
    if (status === "ongoing" && !paymentComplete) {
      setTimeLeft(30) // Reset timer to 30 seconds when entering this state
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            handleCancelBooking(displayBooking.id) // Call the API cancellation function
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      // If status is not ongoing or payment is complete, ensure timer is cleared and reset
      setTimeLeft(30) // Reset for next time this booking might become ongoing and unpaid
    }

    // Cleanup function for the useEffect
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [status, paymentComplete, displayBooking.id]) // Dependencies: status, paymentComplete, and booking ID

  // Check for provider arrival (existing logic)
  useEffect(() => {
    const checkProviderArrival = () => {
      const providerArrivedData = localStorage.getItem("providerArrived")
      if (providerArrivedData) {
        try {
          const data = JSON.parse(providerArrivedData)
          if (data.bookingId === displayBooking.id) {
            // Compare with actual _id
            setProviderArrived(true)
          }
        } catch (e) {
          console.error("Error parsing provider arrival data", e)
        }
      }
    }

    checkProviderArrival()
    const intervalId = setInterval(checkProviderArrival, 2000)
    return () => clearInterval(intervalId)
  }, [displayBooking.id])

  const isBookingDateTimeReached = () => {
    if (!displayBooking.bookingDate || !displayBooking.bookingTime) {
      return false
    }

    const now = new Date()
    const bookingDateTime = new Date(`${displayBooking.bookingDate} ${displayBooking.bookingTime}`)

    // Check if current date/time is on or after the booking date/time
    return now >= bookingDateTime
  }

  const handleTrackProvider = async () => {
    setIsLoadingMap(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token not found")
        setIsLoadingMap(false)
        return
      }

      // Fetch booking details to get provider ID
      const bookingResponse = await fetch(`http://localhost:3000/api/bookings/${displayBooking.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json()
        const providerId = bookingData.providerId

        // Fetch provider's location using getUserLocation API
        if (providerId) {
          const providerLocationResponse = await fetch(`http://localhost:3000/api/user/location`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (providerLocationResponse.ok) {
            const providerLocationData = await providerLocationResponse.json()

            // Provider location could be an object with lat/lng or a string address
            if (providerLocationData.location) {
              if (
                typeof providerLocationData.location === "object" &&
                providerLocationData.location.lat &&
                providerLocationData.location.lng
              ) {
                setProviderLocationCoords({
                  lat: providerLocationData.location.lat,
                  lng: providerLocationData.location.lng,
                })
              } else if (typeof providerLocationData.location === "string") {
                // Geocode the address using the geocode API
                const geocodeResponse = await fetch(`http://localhost:3000/api/geocode`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    address: providerLocationData.location,
                  }),
                })

                if (geocodeResponse.ok) {
                  const geocodedData = await geocodeResponse.json()
                  setProviderLocationCoords({
                    lat: geocodedData.lat,
                    lng: geocodedData.lng,
                  })
                }
              }
            }
          }
        }
      }

      // Get customer's current location using browser geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCustomerCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          (error) => {
            console.error("Error getting current location:", error)
            // Fallback to booking location
            setCustomerCurrentLocation(customerLocation)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        )
      } else {
        // Fallback to booking location
        setCustomerCurrentLocation(customerLocation)
      }

      setShowTrackingModal(true)
    } catch (error) {
      console.error("Error loading tracking data:", error)
    } finally {
      setIsLoadingMap(false)
    }
  }

  const handleCompletePayment = () => {
    // Store the current booking data in localStorage, using the actual _id
    localStorage.setItem("currentBookingDetails", JSON.stringify({ ...displayBooking, id: booking._id }))

    const sellerInfo = {
      _id: booking.providerId, // Use actual MongoDB _id from providerId
      id: booking.providerId, // Keep id for backward compatibility
      name: displayBooking.companyName,
      rating: 4.5,
      reviews: 24,
      location: displayBooking.location || "Local Service Provider",
      price: displayBooking.price,
      startingRate:
        displayBooking.baseRate ||
        displayBooking.price - (displayBooking.distance || 0) * (displayBooking.ratePerKm || 0),
      ratePerKm: displayBooking.ratePerKm || 20,
      description: `${displayBooking.service} - ${displayBooking.serviceType || ""}`.trim(),
      workerCount: displayBooking.workerCount || 1,
    }

    // Navigate to transaction page with seller info and booking details, passing the actual _id
    navigate("/transaction", {
      state: {
        seller: sellerInfo,
        booking: {
          id: booking._id, // Pass the actual MongoDB _id here
          service: displayBooking.service,
          serviceType: displayBooking.serviceType,
          date: displayBooking.date,
          location: displayBooking.location,
          distance: displayBooking.distance,
          baseRate:
            displayBooking.baseRate ||
            displayBooking.price - (displayBooking.distance || 0) * (displayBooking.ratePerKm || 0),
          distanceCharge: (displayBooking.distance || 0) * (displayBooking.ratePerKm || 0),
          additionalFees: displayBooking.additionalFees || 0,
          price: displayBooking.price,
          workerCount: displayBooking.workerCount,
          estimatedTime: displayBooking.estimatedTime,
        },
      },
    })
  }

  const handleCompleteService = async () => {
    // Show the review modal instead of directly updating customer confirmation
    setShowReviewModal(true)
  }

  const handleProviderReviewSubmit = async () => {
    if (reviewRating === null) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token not found")
        return
      }

      // Submit provider rating to update provider's rating fields
      const providerRatingResponse = await fetch(
        `http://localhost:3000/api/bookings/${displayBooking.id}/provider-review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            providerRating: reviewRating, // Changed from 'rating' to 'providerRating'
            providerReview: reviewText, // Changed from 'review' to 'providerReview'
            // Removed providerId - backend gets it from assignedWorkers
          }),
        },
      )

      if (!providerRatingResponse.ok) {
        const errorData = await providerRatingResponse.json()
        console.error("Failed to submit provider rating:", errorData)
        return
      }

      // After rating, update customer confirmation
      const confirmationResponse = await fetch(
        `http://localhost:3000/api/bookings/${displayBooking.id}/service-completion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerConfirmation: true,
          }),
        },
      )

      if (confirmationResponse.ok) {
        const updatedBooking = await confirmationResponse.json()
        setBooking(updatedBooking)
        setShowReviewModal(false)
        setShowSuccessModal(true)

        // Store review data
        localStorage.setItem(
          "serviceReview",
          JSON.stringify({
            id: displayBooking.id,
            timestamp: new Date().getTime(),
            rating: reviewRating,
            text: reviewText,
          }),
        )
      } else {
        console.error("Failed to update customer confirmation")
      }
    } catch (error) {
      console.error("Error submitting provider review:", error)
    }
  }

  const handleSkipReview = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token not found")
        return
      }

      // Update customer confirmation without rating
      const response = await fetch(`http://localhost:3000/api/bookings/${displayBooking.id}/service-completion`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerConfirmation: true,
        }),
      })

      if (response.ok) {
        const updatedBooking = await response.json()
        setBooking(updatedBooking)
        setShowReviewModal(false)
        setShowSuccessModal(true)
      } else {
        console.error("Failed to update customer confirmation")
      }
    } catch (error) {
      console.error("Error skipping review:", error)
    }
  }

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false)
    // The status will remain "active" with customerConfirmation = true

    localStorage.removeItem("providerArrived")
    setShowTrackingModal(false)
  }

  const handleViewDetails = () => {
    localStorage.setItem("currentBookingDetails", JSON.stringify(displayBooking))
    setShowDetailsModal(true)
  }

  const handleBookAgain = () => {
    setShowBookAgainModal(true)
    // Reset all states
    const today = new Date().toISOString().split("T")[0]
    setRebookDate(today)
    setRebookTime("")
    setUseSameLocation(true)
    setNewLocation({ name: "", lat: 0, lng: 0, distance: 0 })
  }

  const handleOpenReportModal = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token missing")
        return
      }

      // Fetch provider details using getUserProfile
      const response = await axios.get(`http://localhost:3000/api/user/profile/${booking.providerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data) {
        // Merge fetched data into seller object
        const providerData = response.data.user || response.data
        setBooking((prev) => ({
          ...prev,
          profilePicture: providerData.profilePicture || "",
        }))
      }

      setShowReportModal(true)
      setTimeout(() => setReportModalVisible(true), 10)
    } catch (error) {
      console.error("Error fetching provider profile:", error)
      setShowReportModal(true)
      setTimeout(() => setReportModalVisible(true), 10)
    }
  }


  const handleCloseReportModal = () => {
    setReportModalVisible(false)
    setTimeout(() => {
      setShowReportModal(false)
      setReportReason("")
      setReportDetails("")
    }, 300)
  }

  const handleSubmitReport = async (proofImages: File[]) => {
    try {
      const formData = new FormData()
      formData.append("reportedUserId", booking.providerId)
      formData.append("reason", reportReason)
      formData.append("details", reportDetails)
      formData.append("bookingId", booking._id)

      proofImages.forEach((image) => {
        formData.append("proofImages", image)
      })

      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No auth token found")
        return
      }

      await axios.post("http://localhost:3000/api/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      setReportModalVisible(false)
      setTimeout(() => {
        setShowReportModal(false)
        setShowReportSuccessModal(true)
        setTimeout(() => setShowReportSuccessModal(false), 2000)
      }, 300)
    } catch (error) {
      console.error("Error submitting report:", error)
    }
  }

  const getSellerName = () => {
    return booking.providerName || booking.companyName || "Provider"
  }

  const getJobTitle = () => {
    return booking.service || booking.productName || "Service"
  }

  const handleSelectNewLocation = async (location: any) => {
    // If location has coordinates, use them directly
    if (location.lat && location.lng) {
      setNewLocation({
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        distance: location.distance,
      })
      setShowLocationModal(false)
      return
    }

    // If only address/name is provided, geocode it
    if (location.name) {
      const geocoded = await geocodeAddress(location.name)
      if (geocoded) {
        // Calculate distance from company location
        const distance = calculateDistance(companyLocation.lat, companyLocation.lng, geocoded.lat, geocoded.lng)
        setNewLocation({
          name: geocoded.name,
          lat: geocoded.lat,
          lng: geocoded.lng,
          distance: distance,
        })
        setShowLocationModal(false)
      } else {
        setRebookErrorMessage("Could not find the specified location. Please try a different address.")
        setShowRebookErrorModal(true)
      }
    }
  }

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const companyLocation = {
    lat: 10.3157,
    lng: 123.8854,
    name: "Company Location",
  }

  const handleSubmitRebook = async () => {
    if (!rebookDate || !rebookTime) {
      setRebookErrorMessage("Please select both date and time")
      setShowRebookErrorModal(true)
      return
    }

    setIsSubmittingRebook(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setRebookErrorMessage("Authentication token not found. Please login again.")
        setShowRebookErrorModal(true)
        setIsSubmittingRebook(false)
        return
      }

      // Calculate original pricing WITHOUT any coupon discount
      // Use the base pricing structure from the original booking
      const originalBaseRate = booking.pricing.baseRate
      const originalDistanceCharge = booking.pricing.distanceCharge
      const originalTotalRate = originalBaseRate + originalDistanceCharge

      // Determine which location to use
      let locationToUse = booking.location

      // If using a new location, validate and use it
      if (!useSameLocation) {
        if (!newLocation.name || newLocation.name.trim() === "") {
          setRebookErrorMessage("Please enter a valid location address")
          setShowRebookErrorModal(true)
          setIsSubmittingRebook(false)
          return
        }

        // If coordinates are not set (0, 0), geocode the address
        if (newLocation.lat === 0 && newLocation.lng === 0) {
          const geocoded = await geocodeAddress(newLocation.name)
          if (geocoded) {
            const distance = calculateDistance(companyLocation.lat, companyLocation.lng, geocoded.lat, geocoded.lng)
            locationToUse = {
              name: geocoded.name,
              lat: geocoded.lat,
              lng: geocoded.lng,
              distance: distance,
            }
          } else {
            setRebookErrorMessage("Could not geocode the location. Please try a different address.")
            setShowRebookErrorModal(true)
            setIsSubmittingRebook(false)
            return
          }
        } else {
          // Use the provided coordinates
          locationToUse = {
            name: newLocation.name,
            lat: newLocation.lat,
            lng: newLocation.lng,
            distance: newLocation.distance,
          }
        }
      }

      // Create new booking with reset fields
      const newBookingData = {
        userId: booking.userId,
        firstname: booking.firstname,
        productName: booking.productName,
        serviceImage: booking.serviceImage,
        providerName: booking.providerName,
        providerId: booking.providerId,
        workerCount: booking.workerCount,
        bookingDate: rebookDate,
        bookingTime: rebookTime,
        location: locationToUse,
        estimatedTime: booking.estimatedTime,
        pricing: {
          baseRate: originalBaseRate,
          distanceCharge: originalDistanceCharge,
          totalRate: originalTotalRate,
        },
        status: "pending",
        serviceType: booking.serviceType,
        ratePerKm: booking.ratePerKm || originalDistanceCharge / booking.location.distance,
        baseRate: originalBaseRate,
        // Reset all fields that should start fresh
        assignedWorkers: [],
        workersFilled: false,
        rating: null,
        review: null,
        reviewDate: null,
        isRated: false,
        providerAccepted: false,
        providerConfirmation: false,
        customerConfirmation: false, // Initialize customerConfirmation to false for new bookings
        serviceComplete: false,
        destinationArrived: false,
        paymentComplete: false,
        paymentMethod: null,
      }

      const response = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create new booking")
      }

      const newBooking = await response.json()
      console.log("New booking created:", newBooking)

      // Close modal and reset form
      setShowBookAgainModal(false)
      setRebookDate("")
      setRebookTime("")

      // Show success modal
      setShowRebookSuccessModal(true)

      // Trigger a refresh of bookings after 2 seconds
      setTimeout(() => {
        localStorage.setItem(
          "bookingStatusUpdate",
          JSON.stringify({ id: newBooking._id, status: "pending", timestamp: new Date().getTime() }),
        )
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error creating new booking:", error)
      setRebookErrorMessage(error instanceof Error ? error.message : "Failed to create booking. Please try again.")
      setShowRebookErrorModal(true)
    } finally {
      setIsSubmittingRebook(false)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Pending
          </div>
        )
      case "active":
        return (
          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </div>
        )
      case "ongoing":
        return (
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Ongoing
          </div>
        )
      case "cancelled":
        return (
          <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-full text-xs font-medium">
            <XCircleIcon className="w-3 h-3" />
            Cancelled
          </div>
        )
      case "completed":
        return (
          <div className="flex items-center gap-1 text-sky-600 bg-sky-50 px-2 py-1 rounded-full text-xs font-medium">
            <CheckSquare className="w-3 h-3" />
            Completed
          </div>
        )
      default:
        return null
    }
  }

  const getActionButtons = () => {
    switch (status) {
      case "pending":
        return (
          <div className="flex gap-2 mt-4">
            <button
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-[14px]"
              onClick={handleBookAgain}
            >
              <RotateCcw className="w-3 h-3" />
              Book Again
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
              onClick={() => handleCancelBooking(displayBooking.id)} // Use the new API cancellation
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )
      case "active":
        if (displayBooking.workersFilled) {
          if (
            (displayBooking.paymentComplete &&
              displayBooking.bookingDate &&
              displayBooking.bookingTime &&
              !displayBooking.bookingDate) ||
            !displayBooking.bookingTime
          ) {
            return (
              <div className="flex gap-2">
                <div className="text-[14px] flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-sky-500 rounded-lg">
                  <Clock className="w-4 h-4" />
                  All Settled, Waiting for Booking Day
                </div>
              </div>
            )
          } else if (displayBooking.paymentComplete && displayBooking.bookingDate && displayBooking.bookingTime) {
            if (displayBooking.customerConfirmation) {
              return (
                <div className="text-[14px] flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg">
                  <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                  Waiting for payment release
                </div>
              )
            } else if (isBookingDateTimeReached()) {
              return (
                <div className="flex flex-col mt-2 gap-2">
                  <button
                    className="flex-1 text-[14px] flex items-center justify-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors cursor-pointer"
                    onClick={handleTrackProvider}
                  >
                    Provider is on the way! Track Now
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-[14px]"
                    onClick={handleOpenReportModal}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Report
                  </button>
                </div>
              )
            } else {
              return (
                <div className="flex gap-2">
                  <div className="text-[14px] flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-sky-500 rounded-lg">
                    <Clock className="w-4 h-4" />
                    All Settled, Waiting for Booking Day
                  </div>
                </div>
              )
            }
          } else {
            return (
              <div className="flex flex-col gap-2">
                <div className="flex text-[14px] items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  Waiting for provider...
                </div>
                <button
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-[14px]"
                  onClick={handleCancelClick}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )
          }
        } else {
          return (
            <div className="flex flex-col gap-2">
              <div className="flex text-[14px] items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                Waiting for provider...
              </div>
              <button
                className="flex items-center justify-center gap-1 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-[14px]"
                onClick={handleCancelClick}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )
        }
      case "ongoing":
        if (!displayBooking.paymentComplete) {
          // If payment is not complete, show timer and "Manage Payment"
          return (
            <div className="mt-4 space-y-2">
              {timeLeft !== null && timeLeft > 0 && (
                <div className="text-center text-sm font-medium text-red-600 animate-pulse">
                  Complete payment in: {timeLeft}s
                </div>
              )}
              <button
                className={`w-full flex items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${timeLeft === 0
                  ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                onClick={handleCompletePayment}
                disabled={timeLeft === 0}
              >
                <ArrowUpRight className="w-4 h-4" />
                Manage Payment
              </button>
            </div>
          )
        } else {
          // If payment is complete for an ongoing booking, show "Complete Service"
          return (
            <button
              className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
              onClick={handleCompleteService}
            >
              <CheckSquare className="w-4 h-4" />
              Complete Service
            </button>
          )
        }
      case "cancelled":
        return (
          <button
            className="flex items-center gap-1 px-4 py-2 mt-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors w-full justify-center text-[14px]"
            onClick={handleBookAgain}
          >
            <RotateCcw className="w-3 h-3" />
            Book Again
          </button>
        )
      case "completed":
        return (
          <button
            className="flex items-center gap-1 px-4 py-2 mt-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors w-full justify-center text-[14px]"
            onClick={handleBookAgain}
          >
            <RotateCcw className="w-3 h-3" />
            Book Again
          </button>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="w-full sm:w-1/3 relative h-[150px]">
        <img
          src={displayBooking.image || "/placeholder.svg"}
          alt={displayBooking.service}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full sm:w-2/3 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-700 text-base">{displayBooking.companyName}</h3>
            <p className="text-gray-600 text-sm mt-1">{displayBooking.service}</p>

            {/* Worker count information */}
            {displayBooking.workerCount && (
              <div className="flex items-center text-gray-500 text-xs mt-1">
                <Users className="w-3 h-3 mr-1 text-sky-500" />
                <span>
                  {displayBooking.workerCount} worker{displayBooking.workerCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {displayBooking.date}
          </div>
          <p className="font-medium">₱{displayBooking.price.toLocaleString()}</p>
        </div>

        {/* View Details Button */}
        <div className="mt-2 mb-1">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            View Details
          </button>
        </div>

        {getActionButtons()}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-xl z-50 w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 13 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-gray-700">Booking Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Service Provider Information */}
              <div className="mb-6 p-5 bg-white border border-gray-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">{displayBooking.companyName}</p>

                  </div>
                  {getStatusBadge()}
                </div>
              </div>

              {/* Two-column layout for service info and payment summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Service Information */}
                <div className="p-5 bg-white border border-gray-300 rounded-lg">
                  <h4 className="text-lg font-medium mb-6 text-gray-700">Service Information</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{displayBooking.service}</span>
                    </div>

                    {displayBooking.serviceType && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                        <span className="text-gray-600">Service Type:</span>
                        <span className="font-medium">{displayBooking.serviceType}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(displayBooking.date)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{displayBooking.location || "Not specified"}</span>
                    </div>

                    {displayBooking.workerCount && (
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1 text-sky-500" />
                        <span>Workers:</span>
                      </div>
                    )}
                    <span className="font-medium">
                      {displayBooking.workerCount} worker{displayBooking.workerCount > 1 ? "s" : ""}
                    </span>

                    {displayBooking.estimatedTime && (
                      <div className="flex justify-between items-center pb-2 mt-3">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-sky-500" />
                          <span>Estimated Time:</span>
                        </div>
                        <span className="font-medium">{displayBooking.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Payment Summary */}
                <div className="p-5 bg-white rounded-lg border border-gray-300">
                  <h4 className="text-lg font-medium mb-6 text-gray-700">Payment Summary</h4>

                  {/* Base Rate */}
                  <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-2">
                    <p className="text-gray-600">Base Service Rate</p>
                    <p className="text-gray-800 font-medium">₱{displayBooking.baseRate?.toLocaleString() || "0"}</p>
                  </div>

                  {/* Distance Charge */}
                  {displayBooking.distance && displayBooking.ratePerKm && (
                    <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-2">
                      <p className="text-gray-600">
                        Distance Charge ({displayBooking.distance.toFixed(1)} km × ₱{displayBooking.ratePerKm})
                      </p>
                      <p className="text-gray-800 font-medium">
                        ₱
                        {(displayBooking.distance * displayBooking.ratePerKm).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2 mt-2">
                    <p className="text-gray-700 font-medium">Total Amount</p>
                    <p className="text-xl text-gray-800 font-bold">₱{displayBooking.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                {status === "pending" && (
                  <button
                    onClick={() => {
                      handleCancelBooking(displayBooking.id) // Use the new API cancellation
                      setShowDetailsModal(false)
                    }}
                    className="px-4 py-2 bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}

                {status === "ongoing" &&
                  !displayBooking.paymentComplete && ( // Only show manage payment if ongoing and not yet paid
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        handleCompletePayment()
                      }}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      Manage Payment
                    </button>
                  )}

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tracking Modal */}
      <AnimatePresence>
        {showTrackingModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTrackingModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-5 shadow-xl z-50 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Service Provider Tracking</h3>
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {booking.customerConfirmation ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Waiting for Admin</h4>
                  <p className="text-gray-600 text-center">Please wait while the admin releases the payment</p>
                </div>
              ) : (
                <>
                  <ProviderTrackingMap
                    providerName={displayBooking.companyName}
                    bookingId={displayBooking.id}
                    customerLocation={customerCurrentLocation || customerLocation}
                    providerLocation={providerLocationCoords || { lat: 10.3169, lng: 123.8893 }}
                    onProviderArrived={() => {
                      setProviderArrived(true)
                    }}
                  />

                  <div className="mt-4 flex justify-end">
                    {providerArrived ? (
                      <button
                        onClick={handleCompleteService}
                        className="px-6 py-2.5 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                      >
                        Complete
                      </button>
                    ) : (
                      <button></button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl z-50 w-[90%] max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-medium text-gray-800">Rate Your Provider</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100/80 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={`review-rating-${rating}`}
                      onClick={() => setReviewRating(rating)}
                      className="focus:outline-none"
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Star
                        className={`h-9 w-9 ${reviewRating !== null && rating <= reviewRating
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300"
                          }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  id="review"
                  className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50/80 focus:ring-sky-500 focus:border-transparent focus:outline-none transition-all"
                  rows={3}
                  placeholder="How was your experience with this provider?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  className="px-6 py-2.5 bg-gray-200/80 text-gray-700 rounded-full font-medium"
                  onClick={handleSkipReview}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Skip
                </motion.button>
                <motion.button
                  className={`px-6 py-2.5 bg-sky-500 text-white rounded-full font-medium shadow-sm ${reviewRating === null ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-600"
                    }`}
                  // Changed onClick to use handleProviderReviewSubmit
                  onClick={handleProviderReviewSubmit}
                  disabled={reviewRating === null}
                  whileTap={reviewRating !== null ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  Submit Review
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl z-50 w-[90%] max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Your Review!</h3>
                <p className="text-gray-600 mb-6">
                  Your feedback has been submitted. Please wait for the admin to release the payment.
                </p>
                <motion.button
                  onClick={handleSuccessConfirm}
                  className="px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 transition-all duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Book Again Modal */}
      <AnimatePresence>
        {showBookAgainModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookAgainModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-xl z-50 w-[90%] max-w-4xl border border-white/20 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 13 }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-medium text-gray-800">Book Again</h3>
                <button
                  onClick={() => setShowBookAgainModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Book the same service with {displayBooking.companyName}. Select a new date and time:
                </p>

                {/* Service Details - Centered */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-4 h-4 text-primary" />
                    <p className="font-medium text-gray-700">{displayBooking.service}</p>
                  </div>
                  {displayBooking.serviceType && (
                    <p className="text-sm text-gray-600 mb-1">{displayBooking.serviceType}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-3 h-3" />
                    <span>
                      {displayBooking.workerCount} worker{displayBooking.workerCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[16px] font-medium text-primary mt-8">
                    Approximate total is ₱{(booking.pricing.baseRate + booking.pricing.distanceCharge).toLocaleString()}
                  </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Date and Time */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="rebookDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        id="rebookDate"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={rebookDate}
                        onChange={(e) => setRebookDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div>
                      <label htmlFor="rebookTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time
                      </label>
                      <input
                        type="time"
                        id="rebookTime"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={rebookTime}
                        onChange={(e) => setRebookTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Right Column - Location Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Location Preference</label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="locationChoice"
                          checked={useSameLocation}
                          onChange={() => setUseSameLocation(true)}
                          className="mt-1 w-4 h-4 text-sky-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">Use Same Location</p>
                          <p className="text-xs text-gray-500 mt-1">{booking.location.name}</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="locationChoice"
                          checked={!useSameLocation}
                          onChange={() => setUseSameLocation(false)}
                          className="mt-1 w-4 h-4 text-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">Choose New Location</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Select a different service location for this booking
                          </p>
                        </div>
                      </label>
                    </div>

                    {!useSameLocation && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          {newLocation.name ? `Selected: ${newLocation.name}` : "No location selected"}
                        </p>
                        <button
                          onClick={() => setShowLocationModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Choose Location on Map</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-full font-medium cursor-pointer"
                  onClick={() => setShowBookAgainModal(false)}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={`px-6 py-2.5 bg-sky-500 text-white rounded-full font-medium shadow-sm ${!rebookDate || !rebookTime || isSubmittingRebook
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-sky-600 cursor-pointer"
                    }`}
                  onClick={handleSubmitRebook}
                  disabled={!rebookDate || !rebookTime || isSubmittingRebook}
                  whileTap={rebookDate && rebookTime && !isSubmittingRebook ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isSubmittingRebook ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    "Confirm Booking"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Book Again Success Modal */}
      <AnimatePresence>
        {showRebookSuccessModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-8 shadow-2xl z-[60] w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-medium text-gray-700 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Booking Successful!
                </motion.h3>
                <motion.p
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Your booking has been created successfully. The provider will review your request shortly.
                </motion.p>
                <motion.div
                  className="w-full bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm font-medium text-emerald-800 mb-1">Status: Pending</p>
                  <p className="text-xs text-emerald-700">You'll be notified once the provider accepts your booking</p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Book Again Error Modal */}
      <AnimatePresence>
        {showRebookErrorModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRebookErrorModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-8 shadow-2xl z-[60] w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <XCircleIcon className="w-10 h-10 text-rose-600" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-semibold text-gray-900 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Booking Failed
                </motion.h3>
                <motion.p
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {rebookErrorMessage}
                </motion.p>
                <motion.button
                  onClick={() => setShowRebookErrorModal(false)}
                  className="px-8 py-3 bg-rose-600 text-white rounded-full font-medium shadow-sm hover:bg-rose-700 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Selection Modal */}
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={handleSelectNewLocation}
        companyLocation={companyLocation}
        savedLocations={[]}
        previousLocation={null}
      />

      {/* Cancel Warning Modal */}
      <AnimatePresence>
        {showCancelWarningModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelWarningModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-8 shadow-2xl z-[60] w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-medium text-gray-700 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Cannot Cancel Booking
                </motion.h3>
                <motion.p
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  You can only cancel bookings 3 days or more before the scheduled service date.
                </motion.p>
                <motion.button
                  onClick={() => setShowCancelWarningModal(false)}
                  className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium shadow-sm hover:bg-amber-600 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Got It
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        modalVisible={reportModalVisible}
        seller={{
          id: booking?.providerId || booking?._id || "",
          name: booking?.providerName || "Service Provider",
          firstName: booking?.firstname || "",
          lastName: "", // Not in your Booking type
          middleName: "", // Not in your Booking type
          username: "", // Not in your Booking type
          businessName: booking?.companyName || "",
          profilePicture: booking?.profilePicture || "",
          totalRating: booking?.averageRating || 0,
          reviews: booking?.totalReviews || 0,
          totalReviews: booking?.totalReviews || 0,
          startingRate: booking?.pricing?.baseRate || 0,
          ratePerKm: booking?.ratePerKm || 0,
          badges: [], // Booking doesn’t have badges
          description: booking?.productName || "Service booking",
          location: booking?.location || { name: "Unknown", lat: 0, lng: 0, distance: 0 },
          workerCount: booking?.workerCount || 0,
          estimatedTime: booking?.estimatedTime || "",
          isVerified: false, // No verification field in Booking
        }}
        reportReason={reportReason}
        reportDetails={reportDetails}
        showSuccessModal={showSuccessModal}
        onClose={handleCloseReportModal}
        onReasonChange={setReportReason}
        onDetailsChange={setReportDetails}
        onSubmit={handleSubmitReport}
        getSellerName={getSellerName}
        getJobTitle={getJobTitle}
      />

    </div>
  )
}

const FloatingDock: React.FC = () => {
  const [showDrawer, setShowDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAllServices, setShowAllServices] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("all") // 'all', 'pending', 'active', 'ongoing', 'cancelled', 'completed', 'coupons'
  const [activeCouponTab, setActiveCouponTab] = useState("available") // 'available', 'used', 'expired'
  const [showDock, setShowDock] = useState(true)
  const [showNotificationPopup, setShowNotificationPopup] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0) // Start with 2 unread notifications

  const [hoveredCompany, setHoveredCompany] = useState<any>(null)
  const [companyHoverPosition, setCompanyHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    // Try to get user ID from localStorage first, then sessionStorage
    const storedUserId = localStorage.getItem("user") || sessionStorage.getItem("user")

    // If no stored ID, try to get from user object
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserId(user._id || user.id || storedUserId)
      } catch (error) {
        console.error("Error parsing user data:", error)
        setUserId(storedUserId)
      }
    } else {
      setUserId(storedUserId)
    }
  }, [])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      const data = await response.json()
      const unreadCount = data.filter((n: NotificationItem) => n.status === "unread").length
      setUnreadNotifications(unreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    fetchNotifications()

    // Set up interval to check every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [userId])

  // Function to fetch user bookings from the backend
  const fetchUserBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        console.warn("No authentication token found. Using sample data.")
        return
      }

      const response = await fetch("http://localhost:3000/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch bookings from API.")
      }

      const data: Booking[] = await response.json()
      setBookings(data)
    } catch (err) {
      console.error("Error fetching bookings from API:", err)
      setError(err instanceof Error ? err.message : "Failed to load bookings from API.")
      // Fallback to sample data if API call fails
      console.log("Falling back to sample data.")
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  // Fetch bookings when component mounts
  useEffect(() => {
    fetchUserBookings()
  }, [])

  // Set up polling to refresh bookings every 5 seconds
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchUserBookings(true)
    }, 5000)

    // Clean up interval on component unmount
    return () => clearInterval(pollingInterval)
  }, [])

  // Check localStorage for booking updates and drawer open state
  useEffect(() => {
    // Check if we should open the bookings drawer
    const shouldOpenBookings = localStorage.getItem("openBookingsDrawer")
    if (shouldOpenBookings === "true") {
      setShowDrawer(true)
      localStorage.removeItem("openBookingsDrawer") // Clear the flag
    }

    // Check for recent payment completion
    const recentPayment = localStorage.getItem("recentBookingPayment")
    if (recentPayment) {
      try {
        const paymentData = JSON.parse(recentPayment)

        // Update the booking with payment completion and status
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            // Compare using the actual _id string
            booking._id === paymentData.id
              ? {
                ...booking,
                status: "active",
                paymentComplete: true,
                providerAccepted: false,
              }
              : booking,
          ),
        )

        // If tracking is requested, open the drawer
        if (paymentData.trackProvider) {
          setShowDrawer(true)
          setActiveTab("active")
        }

        localStorage.removeItem("recentBookingPayment") // Clear the data
      } catch (e) {
        console.error("Error parsing recent payment data", e)
      }
    }

    // Check for provider arrival
    const providerArrivedData = localStorage.getItem("providerArrived")
    if (providerArrivedData) {
      try {
        const data = JSON.parse(providerArrivedData)

        // Update the booking with provider arrival
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            // Compare using the actual _id string
            booking._id === data.bookingId
              ? {
                ...booking,
                providerArrived: true,
                status: "ongoing",
                providerAccepted: true,
              }
              : booking,
          ),
        )

        setShowDrawer(true)
        setActiveTab("ongoing")
        localStorage.removeItem("providerArrived")
      } catch (e) {
        console.error("Error parsing provider arrival data", e)
      }
    }

    // Check for service completion
    const serviceCompletedData = localStorage.getItem("serviceCompleted")
    if (serviceCompletedData) {
      try {
        const data = JSON.parse(serviceCompletedData)

        // Update the booking status to completed
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            // Compare using the actual _id string
            booking._id === data.id
              ? {
                ...booking,
                status: "completed",
                providerArrived: false,
              }
              : booking,
          ),
        )

        localStorage.removeItem("serviceCompleted")
      } catch (e) {
        console.error("Error parsing service completion data", e)
      }
    }

    // NEW: Check for booking status updates from BookingCard (e.g., cancellation due to timer)
    const bookingStatusUpdate = localStorage.getItem("bookingStatusUpdate")
    if (bookingStatusUpdate) {
      try {
        const data = JSON.parse(bookingStatusUpdate)
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === data.id
              ? { ...booking, status: data.status } // Update status
              : booking,
          ),
        )
        localStorage.removeItem("bookingStatusUpdate")
      } catch (e) {
        console.error("Error parsing booking status update data from BookingCard", e)
      }
    }

    // Check URL parameters for booking updates (less critical now with API + localStorage)
    const urlParams = new URLSearchParams(window.location.search)
    const bookingIdParam = urlParams.get("bookingId")
    const statusParam = urlParams.get("status")
    const paymentCompleteParam = urlParams.get("paymentComplete")
    const openBookingsParam = urlParams.get("openBookings")
    const customerConfirmation = urlParams.get("customerConfirmation")
    if (bookingIdParam && statusParam) {
      const bookingIdFromUrl = bookingIdParam // This should be the _id string

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingIdFromUrl
            ? {
              ...booking,
              status: statusParam,
              paymentComplete: paymentCompleteParam === "true",
              customerConfirmation: customerConfirmation === "true",
            }
            : booking,
        ),
      )
    }

    if (openBookingsParam === "true") {
      setShowDrawer(true)
    }
  }, [])

  useEffect(() => {
    if (showDrawer) {
      fetchUserCoupons()
    }
  }, [showDrawer])

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === "pending").length
  const activeBookings = bookings.filter((b) => b.status === "active").length

  const filteredBookings = bookings.filter((booking) => {
    const companyName = booking.companyName || booking.providerName || ""
    const service = booking.service || booking.productName || ""
    const serviceType = booking.serviceType || ""

    const matchesSearch =
      companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceType.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && booking.status === activeTab
  })

  const displayedBookings = showAllServices ? filteredBookings : filteredBookings.slice(0, 4)

  const handleNotificationClick = () => {
    setShowNotificationPopup(!showNotificationPopup)
  }

  const updateNotificationBadge = (notifications: NotificationItem[]) => {
    const unreadCount = notifications.filter((n) => n.status === "unread").length
    setUnreadNotifications(unreadCount)
  }

  useEffect(() => {
    if (showDrawer) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showDrawer])

  const fetchUserCoupons = async () => {
    try {
      setLoadingCoupons(true)
      const token = localStorage.getItem("token")
      if (!token) {
        console.warn("[v0] No authentication token found.")
        setCoupons([])
        return
      }

      console.log("[v0] Fetching user coupons from API...")
      const response = await fetch("http://localhost:3000/api/coupons/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Coupon API response status:", response.status)

      if (!response.ok) {
        throw new Error("Failed to fetch coupons")
      }

      const data = await response.json()
      console.log("[v0] Coupon API response data:", data)

      const couponsArray = data.coupons || data
      console.log("[v0] Coupons array:", couponsArray)
      setCoupons(Array.isArray(couponsArray) ? couponsArray : [])
    } catch (err) {
      console.error("[v0] Error fetching coupons:", err)
      setCoupons([])
    } finally {
      setLoadingCoupons(false)
    }
  }

  const getFilteredCoupons = () => {
    if (!Array.isArray(coupons)) {
      console.error("Coupons is not an array:", coupons)
      return []
    }

    const now = new Date()

    switch (activeCouponTab) {
      case "available":
        return coupons.filter((c) => !c.isUsed && new Date(c.expiresAt) > now)
      case "used":
        return coupons.filter((c) => c.isUsed)
      case "expired":
        return coupons.filter((c) => !c.isUsed && new Date(c.expiresAt) <= now)
      default:
        return coupons
    }
  }

  const filteredCoupons = getFilteredCoupons()

  const handleCompanyHover = (e: React.MouseEvent, coupon: any) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCompanyHoverPosition({
      x: rect.right + 10,
      y: rect.top,
    })

    if (coupon.companyId && typeof coupon.companyId === "object") {
      // Company data is populated from backend
      const company = coupon.companyId
      const companySeller = {
        id: company._id,
        name: company.businessName || `${company.firstName || ""} ${company.lastName || ""}`.trim(),
        businessName: company.businessName,
        firstName: company.firstName,
        lastName: company.lastName,
        middleName: company.middleName,
        totalRating: company.averageRating || 0,
        reviews: company.totalReviews || 0,
        location: company.location?.name || "Location not specified",
        startingRate: 0, // This would need to come from a separate service/pricing model
        ratePerKm: 0,
        badges: company.accountType === "coo" ? ["COO"] : [],
        description: company.aboutCompany || "No description available",
        profilePicture: company.profilePicture || null,
      }
      setHoveredCompany(companySeller)
    } else {
      // Fallback if company data is not populated
      const companySeller = {
        id: coupon.companyId,
        name: coupon.companyName || "Service Provider",
        businessName: coupon.companyName,
        totalRating: 0,
        reviews: 0,
        location: "View details",
        startingRate: 0,
        ratePerKm: 0,
        badges: [],
        description: "Company details not available",
        profilePicture: null,
      }
      setHoveredCompany(companySeller)
    }
  }

  const handleCompanyNameLeave = (event: React.MouseEvent) => {
    setTimeout(() => {
      const relatedTarget = event.relatedTarget as Element
      if (!relatedTarget || !relatedTarget.closest("[data-company-preview]")) {
        setHoveredCompany(null)
      }
    }, 100)
  }

  const handleCompanyPreviewLeave = () => {
    setHoveredCompany(null)
  }

  return (
    <AnimatePresence>
      {/* Toggle Button - Only visible when dock is hidden */}
      {!showDock && (
        <motion.button
          onClick={() => setShowDock(true)}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border text-gray-500 rounded-full p-3 shadow-md hover:bg-gray-100 cursor-pointer transition-all duration-200 z-50"
          aria-label="Show dock"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative">
            <motion.div
              animate={
                unreadNotifications > 0
                  ? {
                    scale: [1, 1.1, 1, 1.1, 1],
                    rotate: [0, -10, 10, -10, 10, 0],
                  }
                  : { rotate: [0, -10, 10, -10, 10, 0] }
              }
              transition={{
                duration: unreadNotifications > 0 ? 1.2 : 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: unreadNotifications > 0 ? 2 : 3,
              }}
            >
              <Coffee className="w-5 h-5" />
            </motion.div>

            {unreadNotifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full ring-1 ring-white"
                style={{ transform: "translate(30%, -30%)" }}
              />
            )}
          </div>
        </motion.button>
      )}

      {/* New Dock Design - Horizontal at the bottom with admin styling */}
      {showDock && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-200/40 backdrop-blur-lg rounded-full shadow-lg px-2 py-1 flex items-center transition-all duration-200 hover:shadow-xl z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <DockItem icon={<Home size={20} strokeWidth={1.5} />} to="/" isActive={false} />
          <DockItem
            icon={<Bookmark size={20} strokeWidth={1.5} />}
            to="#"
            isActive={showDrawer}
            onClick={() => setShowDrawer(true)}
          />
          <div className="relative">
            <DockItem
              icon={<Bell size={20} strokeWidth={1.5} className="bell-icon" />}
              to="/notification"
              isActive={showNotificationPopup}
              onClick={handleNotificationClick}
              badge={unreadNotifications}
            />

            {/* Notification Popup */}
            <AnimatePresence>
              {showNotificationPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    mass: 0.5,
                  }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 md:w-96 shadow-xl z-50"
                  style={{
                    transformOrigin: "bottom right",
                    filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <NotificationPopup
                    onClose={() => setShowNotificationPopup(false)}
                    updateBadge={updateNotificationBadge}
                    userId={userId || undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DockItem icon={<User size={20} strokeWidth={1.5} />} to="/profile" isActive={false} />
          <DockItem icon={<MessageCircleMore size={20} strokeWidth={1.5} />} to="/chat" isActive={false} />
          <DockItem icon={<PowerOff size={20} strokeWidth={1.5} />} to="/logout" isActive={false} />

          {/* Hide Dock Button */}
          <div
            className="relative flex items-center justify-center w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out hover:scale-110"
            onClick={() => setShowDock(false)}
            onMouseEnter={(e) => e.currentTarget.classList.add("scale-110")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("scale-110")}
          >
            <div className="flex items-center justify-center transition-all duration-200 text-gray-400 hover:text-primary">
              <ChevronUp size={20} strokeWidth={1.5} />
            </div>
            <div className="absolute -top-8 bg-sky-400 text-white text-xs px-2 py-1 rounded-md opacity-0 transition-all duration-200 hover:opacity-100 hover:transform hover:translate-y-0 transform translate-y-2">
              Hide
            </div>
          </div>
        </motion.div>
      )}

      {/* Side Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-gray-50 shadow-2xl z-40"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Album className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-700">Booking Dashboard</h2>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formattedTime}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${activeTab !== "coupons"
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Bookmark className="w-4 h-4" />
                      Bookings
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("coupons")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "coupons"
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Coupons
                    </div>
                  </button>
                </div>

                {activeTab !== "coupons" ? (
                  <>
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search Services or Companies"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Booking Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === "all"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        All Bookings
                      </button>
                      <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === "pending"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setActiveTab("active")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === "active"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setActiveTab("ongoing")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === "ongoing"
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Ongoing
                      </button>
                      <button
                        onClick={() => setActiveTab("cancelled")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === "cancelled"
                          ? "bg-rose-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Cancelled
                      </button>
                      <button
                        onClick={() => setActiveTab("completed")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === "completed"
                          ? "bg-sky-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Completed
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => setActiveCouponTab("available")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeCouponTab === "available"
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => setActiveCouponTab("used")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeCouponTab === "used"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Used
                      </button>
                      <button
                        onClick={() => setActiveCouponTab("expired")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeCouponTab === "expired"
                          ? "bg-gray-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Expired
                      </button>
                    </div>
                  </>
                )}
              </div>

              {activeTab !== "coupons" ? (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 text-gray-700">
                    <StatCard
                      title="Total"
                      count={totalBookings}
                      icon={<Bookmark className="w-5 h-5" />}
                      trend="up"
                      trendValue={12}
                    />
                    <StatCard
                      title="Pending"
                      count={pendingBookings}
                      icon={<AlertCircle className="w-5 h-5" />}
                      trend="down"
                      trendValue={5}
                    />
                    <StatCard
                      title="Active"
                      count={activeBookings}
                      icon={<CheckCircle2 className="w-5 h-5" />}
                      trend="up"
                      trendValue={8}
                    />
                  </div>

                  {/* Bookings List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mb-2"></div>
                        <p>Loading bookings...</p>
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                        <p>Error loading bookings</p>
                        <p className="text-sm">{error}</p>
                        <button
                          onClick={() => fetchUserBookings()}
                          className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : displayedBookings.length > 0 ? (
                      displayedBookings.map((booking) => (
                        <BookingCard key={`booking-${booking._id}`} booking={booking} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <Filter className="w-10 h-10 mb-2 opacity-50" />
                        <p>No bookings found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    )}

                    {filteredBookings.length > 4 && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAllServices(!showAllServices)}
                          className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm"
                        >
                          {showAllServices ? (
                            <>
                              Show Less
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              View More
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">How to use your coupons:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                          <li>Coupons are automatically applied during checkout</li>
                          <li>Each coupon is valid only for the specified company</li>
                          <li>Check expiration dates and minimum purchase requirements</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loadingCoupons ? (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mb-2"></div>
                        <p>Loading coupons...</p>
                      </div>
                    ) : filteredCoupons.length > 0 ? (
                      filteredCoupons.map((coupon) => (
                        <motion.div
                          key={coupon._id}
                          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Ticket className="w-4 h-4 text-primary" />
                                  <h3
                                    className="font-semibold text-gray-800 cursor-pointer hover:text-primary transition-colors"
                                    onMouseEnter={(e) => handleCompanyHover(e, coupon)}
                                    onMouseLeave={handleCompanyNameLeave}
                                  >
                                    {coupon.companyName || "Service Provider"}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600">Valid for services from this provider</p>
                              </div>
                              {coupon.isUsed ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  Used
                                </span>
                              ) : new Date(coupon.expiresAt) <= new Date() ? (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  Expired
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                  Active
                                </span>
                              )}
                            </div>

                            {/* Coupon Code */}
                            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 mb-3 border-2 border-dashed border-primary/30">
                              <p className="text-xs text-gray-600 mb-1">Coupon Code</p>
                              <p className="text-lg font-bold text-primary tracking-wider">{coupon.code}</p>
                            </div>

                            {/* Discount Info */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-600 mb-1">Discount</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {coupon.discountType === "percentage"
                                    ? `${coupon.discountValue}% OFF`
                                    : `₱${coupon.discountValue} OFF`}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-600 mb-1">Expires</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {new Date(coupon.expiresAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Additional Info */}
                            {(coupon.minPurchase || coupon.maxDiscount) && (
                              <div className="border-t border-gray-100 pt-3 space-y-1">
                                {coupon.minPurchase && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <span className="mr-1">•</span>
                                    Minimum purchase: ₱{coupon.minPurchase.toLocaleString()}
                                  </div>
                                )}
                                {coupon.maxDiscount && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <span className="mr-1">•</span>
                                    Maximum discount: ₱{coupon.maxDiscount.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Used Date */}
                            {coupon.isUsed && coupon.usedAt && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  Used on {new Date(coupon.usedAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <Ticket className="w-10 h-10 mb-2 opacity-50" />
                        <p>No {activeCouponTab} coupons</p>
                        <p className="text-sm">
                          {activeCouponTab === "available"
                            ? "Claim coupons from service providers"
                            : activeCouponTab === "used"
                              ? "You haven't used any coupons yet"
                              : "No expired coupons"}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for drawers */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => {
              setShowDrawer(false)
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {hoveredCompany && (
        <CompanyPreview
          seller={hoveredCompany}
          isVisible={true}
          position={companyHoverPosition}
          onMouseLeave={handleCompanyPreviewLeave}
        />
      )}
    </AnimatePresence>
  )
}

export default FloatingDock