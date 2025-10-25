import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Share, Flag, MapPin, X, Check, ArrowLeft, Users, CheckCircle2, Gift } from "lucide-react"
import axios from "axios"
import QRCode from "qrcode"

import LocationSelectionModal from "./LocationSelectionModal"
import CompanyPreview from "./CompanyPreview"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import serviceLogo from "@/assets/Logo/12.png"

const animationStyles = `
@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes bounceIn {
0% { transform: scale(0); opacity: 0; }
60% { transform: scale(1.2); }
100% { transform: scale(1); opacity: 1; }
}

@keyframes slideInUp {
from { transform: translateY(20px); opacity: 0; }
to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
0% { transform: scale(1); }
50% { transform: scale(1.05); }
100% { transform: scale(1); }
}
`

interface Seller {
  profilePicture: any
  id: number | string // Allow string for dynamic service IDs
  firstName?: string
  lastName?: string
  middleName?: string
  name?: string // Keep as optional fallback
  username?: string // Virtual property from User model
  businessName?: string
  totalRating: number
  reviews: number
  location: string
  startingRate: number
  ratePerKm: number
  badges: string[]
  description: string
  workerCount?: number
  estimatedTime?: string
}

interface CooDetails {
  _id: string // Changed to string
  firstName: string
  middleName?: string
  lastName: string
  profilePicture: string | null
  location?: { name: string }
}

interface ServiceDetails {
  id: string | number // Changed to string | number
  name: string
  price: number // This is the base price for the service itself
  category: string
  image: string // Ensure this field is present
  description: string
  workerCount?: number // Optional for static subcategories
  estimatedTime?: string // Optional for static subcategories
  cooId?: CooDetails | null // Changed to cooId
  chargePerKm?: number
  totalRating?: number
  totalReviews?: number
  workersNeeded?: number
  averageRating?: number // New field for average rating
}

interface WorkersModalProps {
  isOpen: boolean
  onClose: () => void
  serviceDetails: ServiceDetails | null // Changed from productName to serviceDetails
  staticSellers: { [key: string]: Seller[] } // The original sellers object
}

interface Location {
  name: string
  lat: number
  lng: number
  distance: number
  estimatedTime?: number
  lightTrafficTime?: number
  midTrafficTime?: number
  heavyTrafficTime?: number
  weatherIssuesTime?: number
}

const COMPANY_LOCATION = {
  lat: 10.243302,
  lng: 123.788994,
  name: "HandyGO Headquarters",
}

function WorkersModal({ isOpen, onClose, serviceDetails, staticSellers }: WorkersModalProps) {
  console.log("WorkersModal: Component rendered. serviceDetails:", serviceDetails) // Log serviceDetails at the start
  const [completeUserData, setCompleteUserData] = useState<any>(null)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [bookingStep, setBookingStep] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [totalRate, setTotalRate] = useState<number>(0)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [confirmationStep, setConfirmationStep] = useState<boolean>(false)
  const [currentMonth] = useState<Date>(new Date())
  const [, setCalendarDays] = useState<Date[]>([])
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [specialRequests, setSpecialRequests] = useState<string>("") // New state for special requests
  const [, setUserDataLoading] = useState(true) // Fixed variable name
  const [isCouponClaimed, setIsCouponClaimed] = useState<boolean>(false)
  const [isCouponSuccessModalOpen, setIsCouponSuccessModalOpen] = useState(false)
  const [claimedCouponData, setClaimedCouponData] = useState<any>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")

  const [hoveredSeller, setHoveredSeller] = useState<Seller | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const companyMarkerRef = useRef<any>(null)
  const lineRef = useRef<any>(null)

  // Generate calendar days for the current month
  useEffect(() => {
    const days = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get the first day of the month
    const firstDay = new Date(year, month, 1)
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()

    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i)
      days.push(prevMonthDay)
    }

    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i))
      }
    }

    setCalendarDays(days)
  }, [currentMonth])

  // Reset scroll position when changing steps
  useEffect(() => {
    const modalContent = document.getElementById("modal-content")
    if (modalContent) {
      modalContent.scrollTop = 0
    }
  }, [bookingStep, selectedSeller, bookingSuccess, confirmationStep])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current = null
        markerRef.current = null
        companyMarkerRef.current = null
        lineRef.current = null
      }
    }
  }, [bookingStep])

  useEffect(() => {
    // No longer needed without leaflet
  }, [])

  const fetchCompleteUserData = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.warn("No authentication token found. Skipping complete user data fetch.")
        setUserDataLoading(false)
        return
      }

      let userId = null
      if (selectedSeller) {
        userId = selectedSeller.id
      } else if (serviceDetails?.cooId) {
        userId = serviceDetails.cooId._id
      }

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
          console.log("[v0] Found complete user data:", targetUser)
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
    const sellerId = selectedSeller?.id || serviceDetails?.cooId?._id
    if (sellerId) {
      fetchCompleteUserData()
    }
  }, [selectedSeller?.id, serviceDetails?.cooId?._id])

  useEffect(() => {
    if (bookingSuccess) {
      generateReceiptQRCode()
    }
  }, [bookingSuccess])

  if (!isOpen || !serviceDetails) return null

  // Determine the list of providers to display
  const allProviders: (Seller & { isCoo?: boolean; profilePicture?: string | null })[] = []

  if (serviceDetails.cooId) {
    // Check serviceDetails.cooId
    console.log("WorkersModal: serviceDetails.cooId found. Adding COO as provider:", serviceDetails.cooId)

    // Use complete user data if available, otherwise fall back to serviceDetails.cooId
    const userData = completeUserData || serviceDetails.cooId
    console.log("[v0] Using user data for name construction:", userData)

    // Construct proper name from user data
    const cooName =
      [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(" ") ||
      userData.businessName ||
      "Service Provider"

    console.log("[v0] Constructed COO name:", cooName)

    allProviders.push({
      id: serviceDetails.cooId._id, // This should now be a string
      name: cooName, // Use constructed name from complete user data
      firstName: userData.firstName, // Add individual name fields for getSellerName function
      middleName: userData.middleName,
      lastName: userData.lastName,
      businessName: userData.businessName,
      totalRating: userData.averageRating || 0, // Use totalRating from serviceDetails
      reviews: userData.totalReviews || 0, // Use totalReviews from serviceDetails
      location: serviceDetails.cooId.location?.name || "Online/Remote", // Use COO's location
      startingRate: serviceDetails.price,
      ratePerKm: serviceDetails.chargePerKm || 0, // Use chargePerKm from serviceDetails
      badges: ["COO"],
      description: userData.aboutCompany, // Use service description
      workerCount: serviceDetails.workersNeeded || 1, // Use workersNeeded from serviceDetails
      isCoo: true,
      profilePicture: serviceDetails.cooId.profilePicture,
      estimatedTime: serviceDetails.estimatedTime,
    })
  } else {
    console.log("WorkersModal: No cooId found. Using static sellers.")
    // Otherwise, use the static sellers from Home-data.ts
    const serviceSpecificStaticSellers = staticSellers[serviceDetails.name] || []
    allProviders.push(...serviceSpecificStaticSellers)
  }
  console.log("WorkersModal: allProviders array after population:", allProviders, "Length:", allProviders.length) // Log allProviders after population

  const handleShare = (sellerId: number | string) => {
    // In a real app, this would open a share dialog
    alert(`Sharing seller #${sellerId}`)
  }

  const handleReport = (sellerId: number | string) => {
    // In a real app, this would open a report dialog
    alert(`Reporting seller #${sellerId}`)
  }

  const handleBook = (seller: Seller) => {
    setSelectedSeller(seller)
    setBookingStep(1)
    setTotalRate(seller.startingRate)
  }

  // Add a function to open the location modal
  const openLocationModal = () => {
    setIsLocationModalOpen(true)
  }

  // Add a function to close the location modal
  const closeLocationModal = () => {
    setIsLocationModalOpen(false)
  }

  // Add a function to select a location from the modal
  const selectLocation = (location: Location) => {
    // Calculate estimated time (assuming average speed of 30 km/h)
    const estimatedTimeInMinutes = Math.round(location.distance * 2) // 2 minutes per km

    const locationWithTime = {
      ...location,
      estimatedTime: estimatedTimeInMinutes,
    }

    setSelectedLocation(locationWithTime)
    setIsLocationModalOpen(false)

    // Update total rate
    if (selectedSeller) {
      const newTotalRate = selectedSeller.startingRate + location.distance * selectedSeller.ratePerKm
      setTotalRate(newTotalRate)
    }
  }

  // Modify the handleDateSelect function to open the location modal after selecting a date
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`
      setSelectedDate(formattedDate)
    } else {
      setSelectedDate("")
    }
  }

  const handleBookNow = () => {
    setConfirmationStep(true)
  }

  // Helper function to safely get user auth data
  const getUserAuthData = () => {
    try {
      // Get the user data from localStorage
      const userString = localStorage.getItem("user")
      const token = localStorage.getItem("token") // Get token separately

      if (!userString) {
        console.error("No user data found in localStorage")
        return { userId: null, token: null, firstname: "User" }
      }
      if (!token) {
        console.error("No token found in localStorage")
        return { userId: null, token: null, firstname: "User" }
      }

      // Parse user data
      const userData = JSON.parse(userString)
      console.log("User data from localStorage:", userData)
      console.log("Token from localStorage:", token)

      let userId = null
      let firstname = "User"

      // Extract userId and firstname from the parsed user data
      if (userData._id) {
        userId = userData._id
        firstname = userData.firstname || firstname
      } else if (userData.id) {
        userId = userData.id
        firstname = userData.firstname || firstname
      }

      return { userId, token, firstname }
    } catch (error) {
      console.error("Error parsing user data or retrieving token:", error)
      return { userId: null, token: null, firstname: "User" }
    }
  }

  // Add a function to submit booking to MongoDB
  const submitBookingToDatabase = async () => {
    if (!selectedSeller || !selectedLocation || !selectedDate || !selectedTime) {
      console.error("Missing required booking information")
      return { success: false, error: "Missing required booking information" }
    }

    try {
      // Get user auth data using our helper function
      const { userId, token, firstname } = getUserAuthData()

      if (!userId || !token) {
        console.error("Authentication data missing, userId:", userId, "token:", token ? "exists" : "missing")
        return {
          success: false,
          error: "Authentication required. Please log in again.",
          authError: true,
        }
      }

      // Log the token being sent
      console.log("Token being sent:", token)

      // Calculate distance charge
      const distanceCharge = selectedLocation.distance * selectedSeller.ratePerKm

      // Prepare booking data
      const bookingData = {
        userId,
        firstname,
        productName: serviceDetails.name, // Changed from serviceName to productName
        serviceImage: serviceDetails.image, // Add serviceImage here
        providerName: selectedSeller.name,
        providerId: selectedSeller.id,
        workerCount: selectedSeller.workerCount || 1,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        location: {
          name: selectedLocation.name,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          distance: selectedLocation.distance,
        },
        estimatedTime: selectedLocation?.midTrafficTime ? `${selectedLocation.midTrafficTime} min` : "",
        pricing: {
          baseRate: selectedSeller.startingRate,
          distanceCharge: distanceCharge,
          totalRate: totalRate,
        },
        specialRequests: specialRequests, // Include special requests
      }

      console.log("Sending booking data:", bookingData)

      // Directly use localhost URL
      const apiUrl = `http://localhost:3000/api/bookings`
      console.log("API URL:", apiUrl)

      // Send booking data to the server with authentication token
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error("Error creating booking:", errorData)
        console.error("Response status:", response.status)

        if (response.status === 401) {
          return {
            success: false,
            error: "Your session has expired. Please log in again.",
            authError: true,
          }
        }

        return {
          success: false,
          error: errorData.message || `Server error (${response.status})`,
        }
      }

      const result = await response.json()
      console.log("Booking created successfully:", result)

      // Create booking notification
      try {
        const notificationData = {
          userId,
          bookingId: result._id,
          status: "pending",
          serviceName: serviceDetails.name, // Use serviceDetails.name
          providerName: selectedSeller.name,
        }

        console.log("Creating booking notification:", notificationData)

        await fetch(`http://localhost:3000/notifications/booking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(notificationData),
        }).catch((err) => {
          // Log but don't fail if notification creation fails
          console.error("Error creating notification:", err)
        })
      } catch (notificationError) {
        console.error("Error creating booking notification:", notificationError)
        // Continue with booking success even if notification fails
      }

      return { success: true, result }
    } catch (error) {
      console.error("Error submitting booking:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const { success, error, authError } = await submitBookingToDatabase()

      if (success) {
        setIsSubmitting(false)
        setConfirmationStep(false)
        setBookingSuccess(true)
      } else {
        setIsSubmitting(false)
        setErrorMessage(error || "There was an error creating your booking. Please try again.")
        setIsErrorModalOpen(true)

        // If it's an auth error, you might want to redirect to login or handle differently
        if (authError) {
          console.error("Authentication error during booking")
          // You could redirect to login here if needed
          // window.location.href = "/login"
        }
      }
    } catch (error) {
      console.error("Error during booking confirmation:", error)
      setIsSubmitting(false)
      setErrorMessage("An unexpected error occurred. Please try again.")
      setIsErrorModalOpen(true)
    }
  }

  const resetBooking = () => {
    setBookingStep(0)
    setSelectedSeller(null)
    setSelectedDate("")
    setSelectedLocation(null)
    setConfirmationStep(false)
    setBookingSuccess(false)
    setSpecialRequests("") // Reset special requests
    setIsCouponClaimed(false)
    setIsCouponSuccessModalOpen(false)
    setQrCodeDataUrl("")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const handleErrorModalClose = () => {
    setIsErrorModalOpen(false)
    setErrorMessage(null)
  }

  const getSellerName = (seller: any) => {
    console.log("[v0] getSellerName called with seller:", seller)

    // First try to construct name from individual parts
    const nameParts = []
    if (seller?.firstName) nameParts.push(seller.firstName)
    if (seller?.middleName) nameParts.push(seller.middleName)
    if (seller?.lastName) nameParts.push(seller.lastName)

    if (nameParts.length > 0) {
      const fullName = nameParts.join(" ")
      console.log("[v0] Constructed name from parts:", fullName)
      return fullName
    }

    // Fallback to other name fields
    if (seller?.name) {
      console.log("[v0] Using seller.name:", seller.name)
      return seller.name
    }
    if (seller?.username) {
      console.log("[v0] Using seller.username:", seller.username)
      return seller.username
    }
    if (seller?.businessName) {
      console.log("[v0] Using seller.businessName:", seller.businessName)
      return seller.businessName
    }

    console.log("[v0] No name found, using fallback")
    return "Service Provider"
  }

  const handleSellerNameHover = (seller: Seller, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
    setHoveredSeller(seller)
  }

  const handleSellerNameLeave = (event: React.MouseEvent) => {
    setTimeout(() => {
      const relatedTarget = event.relatedTarget as Element
      // Check if the mouse moved to the CompanyPreview modal
      if (!relatedTarget || !relatedTarget.closest("[data-company-preview]")) {
        setHoveredSeller(null)
      }
    }, 100)
  }

  const handlePreviewLeave = () => {
    setHoveredSeller(null)
  }

  // Generate receipt image and QR code
  const generateReceiptQRCode = async () => {
    if (!selectedSeller || !selectedLocation || !selectedDate || !selectedTime) return

    try {
      // Create receipt data object
      const receiptData = {
        service: serviceDetails.name,
        provider: getSellerName(selectedSeller),
        workerCount: selectedSeller.workerCount || 1,
        date: formatDate(selectedDate),
        time: selectedTime
          ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
          : "Not specified",
        location: selectedLocation.name,
        distance: selectedLocation.distance.toFixed(1),
        baseRate: selectedSeller.startingRate,
        distanceCharge: (selectedLocation.distance * selectedSeller.ratePerKm).toFixed(2),
        total: totalRate.toFixed(2),
        lightTraffic: selectedLocation.lightTrafficTime,
        midTraffic: selectedLocation.midTrafficTime,
        heavyTraffic: selectedLocation.heavyTrafficTime,
        weatherIssues: selectedLocation.weatherIssuesTime,
      }

      // Create a URL with receipt data that will trigger download
      const downloadUrl = `${window.location.origin}/download-receipt?data=${encodeURIComponent(JSON.stringify(receiptData))}`

      // Generate base QR code
      const baseQrCode = await QRCode.toDataURL(downloadUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: "#334155", // slate-700
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H", // High error correction to allow logo overlay
      })

      // Create canvas to add logo
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Load QR code image
      const qrImage = new Image()
      qrImage.crossOrigin = "anonymous"
      qrImage.src = baseQrCode

      await new Promise((resolve) => {
        qrImage.onload = resolve
      })

      // Set canvas size
      canvas.width = qrImage.width
      canvas.height = qrImage.height

      // Draw QR code
      ctx.drawImage(qrImage, 0, 0)

      // Create logo background (white circle)
      const logoSize = canvas.width * 0.25
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw white circle background
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(centerX, centerY, logoSize / 2 + 8, 0, 2 * Math.PI)
      ctx.fill()

      // Draw logo border
      ctx.strokeStyle = "#0EA5E9" // sky-500
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, logoSize / 2 + 8, 0, 2 * Math.PI)
      ctx.stroke()

      // Draw simple HandyGO icon (stylized "H" with wrench)
      ctx.fillStyle = "#0EA5E9" // sky-500
      ctx.font = `bold ${logoSize * 0.6}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("H", centerX, centerY)

      // Convert to data URL
      const finalQrCode = canvas.toDataURL("image/png")
      setQrCodeDataUrl(finalQrCode)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  // Generate QR code when booking is successful
  // useEffect(() => {
  //   if (bookingSuccess) {
  //     generateReceiptQRCode()
  //   }
  // }, [bookingSuccess])

  const handleClaimCoupon = async () => {
    setIsCouponLoading(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.error("No authentication token found")
        setErrorMessage("Please log in to claim coupons")
        setIsErrorModalOpen(true)
        setIsCouponLoading(false)
        return
      }

      const companyId = selectedSeller?.id
      const companyName = selectedSeller?.name || selectedSeller?.businessName || getSellerName(selectedSeller)

      if (!companyId || !companyName) {
        console.error("Missing company information")
        setErrorMessage("Unable to claim coupon. Company information is missing.")
        setIsErrorModalOpen(true)
        setIsCouponLoading(false)
        return
      }

      const response = await axios.post(
        "http://localhost:3000/api/coupons/claim",
        {
          companyId,
          companyName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.status === 201) {
        setIsCouponClaimed(true)
        setClaimedCouponData(response.data.coupon)
        setIsCouponSuccessModalOpen(true)

        // Auto-close the coupon success modal after 3 seconds
        setTimeout(() => {
          setIsCouponSuccessModalOpen(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error claiming coupon:", error)

      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || "Failed to claim coupon. Please try again."
        setErrorMessage(errorMsg)
      } else {
        setErrorMessage("An unexpected error occurred while claiming the coupon.")
      }

      setIsErrorModalOpen(true)
    } finally {
      setIsCouponLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <style>{animationStyles}</style>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/40">
        {/* Header section - always visible */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100/50 bg-white/80 backdrop-blur-sm">
          {bookingStep === 0 && !selectedSeller && !bookingSuccess && !confirmationStep && (
            <>
              {/*  */}
              <h2 className="text-xl font-medium text-gray-700">Providers for {serviceDetails.name}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </>
          )}

          {selectedSeller && bookingStep === 1 && !confirmationStep && !bookingSuccess && (
            <>
              <div>
                <button
                  onClick={resetBooking}
                  className="flex items-center text-sky-600 hover:text-sky-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to providers
                </button>
                <h2 className="text-[19px] font-medium text-gray-700 mt-5">Schedule your service</h2>
                <p className="mt-1 text-[14.5px] mb-8 text-gray-500/80 font-normal]">
                  Please choose your preferred date and time for the service. Our team will review your request and
                  confirm if the booking is available
                </p>
              </div>
            </>
          )}

          {selectedSeller && bookingStep === 2 && !confirmationStep && !bookingSuccess && (
            <>
              <div>
                <button
                  onClick={() => setBookingStep(1)}
                  className="flex items-center text-sky-600 hover:text-sky-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to date selection
                </button>
                <h2 className="text-[19px] font-medium text-gray-700 mt-5">Select Service Location</h2>
                <p className="mt-1 text-[14.5px] text-gray-500/80 font-normal]">
                  Please provide the exact address so company providers can reach you without any delays. If there are
                  unforeseen incidents, providers will contact you through OHS Chat to reschedule the service, and
                  you'll receive a coupon for the inconvenience. We will cover the VAT after service completion
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Update the header for `confirmationStep`: */}
          {confirmationStep && (
            <>
              <h2 className="text-xl font-medium text-gray-700">Finalize Booking!</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </>
          )}

          {bookingSuccess && (
            <>
              <h2 className="text-xl font-medium text-gray-700">Booking Confirmation</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Scrollable content area */}
        <div id="modal-content" className="overflow-y-auto flex-grow bg-white">
          {bookingStep === 0 && !selectedSeller && !bookingSuccess && !confirmationStep && (
            <div className="p-6">
              {allProviders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No providers available for this service</p>
              ) : (
                <div className="space-y-4">
                  {allProviders.map((seller, index) => {
                    return (
                      <div
                        key={seller.id ? String(seller.id) : `seller-${index}`}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/90 transition-all duration-300 border border-gray-200/30 shadow-lg transform"
                        style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200/50 shadow-sm mr-4">
                                {seller.profilePicture ? (
                                  <img
                                    src={seller.profilePicture || "/placeholder.svg"}
                                    alt={getSellerName(seller)}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-medium bg-gray-50">
                                    {getSellerName(seller).charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3
                                  className="text-gray-900 font-medium text-lg mb-1 cursor-pointer hover:text-sky-600 transition-colors"
                                  onMouseEnter={(e) => handleSellerNameHover(seller, e)}
                                  onMouseLeave={handleSellerNameLeave}
                                >
                                  {getSellerName(seller)}
                                </h3>
                                <p className="text-gray-500 text-sm flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" /> {seller.location}
                                </p>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 mt-4 leading-relaxed">{seller.description}</p>

                            {seller.workerCount && (
                              <div className="flex items-center mb-4 text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
                                <Users className="h-4 w-4 mr-2 text-gray-500" />
                                <span>
                                  {seller.workerCount} worker{seller.workerCount > 1 ? "s" : ""} will complete this
                                  service
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0 ml-6">
                            <div className="text-right">
                              <div className="text-yellow-500 mb-1">
                                {"★".repeat(seller.totalRating)}
                                {"☆".repeat(5 - seller.totalRating)}
                              </div>
                              <p className="text-gray-500 text-sm">{seller.reviews} reviews</p>
                            </div>
                          </div>
                        </div>

                        {seller.totalRating === 0 && seller.reviews === 0 && (
                          <div className="mb-[-20px]">
                            <div className="bg-green-50 border border-green-200/50 rounded-xl p-4">
                              <div className="flex items-center mb-2">
                                <Check className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-green-800 font-medium text-sm">
                                  Be the first customer to book this company!
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                Be among the first to experience excellence and receive a coupon as an exclusive reward
                                for being the first customer to book this service.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200/50">
                          <div className="text-gray-800 font-medium text-lg">
                            Starting at ₱{seller.startingRate.toLocaleString()} • ₱{seller.ratePerKm}/km
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShare(seller.id)
                              }}
                              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 active:scale-95"
                            >
                              <Share className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReport(seller.id)
                              }}
                              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 active:scale-95"
                            >
                              <Flag className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBook(seller)
                              }}
                              className={`px-6 py-2.5 rounded-full font-medium shadow-sm transition-all duration-200 ${seller.totalRating === 0 && seller.reviews === 0
                                  ? "bg-sky-500 text-white hover:bg-sky-600 shadow-lg"
                                  : "bg-sky-500 text-white hover:bg-sky-600"
                                }`}
                            >
                              {seller.totalRating === 0 && seller.reviews === 0 ? "Book First & Save!" : "Book Now"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {selectedSeller && bookingStep === 1 && !confirmationStep && !bookingSuccess && (
            <div className="p-8 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl max-w-4xl mx-auto">
              {/* Company Header - Now displays Selected Service */}
              <div className="mb-8">
                <div className="flex flex-col items-center gap-4 mb-6 text-center justify-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white">
                    <img
                      src={serviceDetails.image || "/placeholder.svg"}
                      alt={serviceDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[22px] font-medium text-gray-900 mb-2">{serviceDetails.name}</h3>
                    <p className="text-gray-700 leading-relaxed mb-5">{serviceDetails.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedSeller.estimatedTime && (
                    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Estimated Duration</p>
                        <p className="text-sm text-gray-600">{selectedSeller.estimatedTime}</p>
                      </div>
                    </div>
                  )}

                  {selectedSeller.workerCount && (
                    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Team Size</p>
                        <p className="text-sm text-gray-600">
                          {selectedSeller.workerCount} worker{selectedSeller.workerCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections */}
              <div className="mb-8">
                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Enhanced Date Picker */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Select Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-12 border-2 hover:border-sky-300 transition-colors",
                              !selectedDate && "text-muted-foreground",
                              selectedDate && "border-sky-200 bg-sky-50/50",
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 text-sky-600" />
                            {selectedDate ? (
                              <span className="font-medium">{format(new Date(selectedDate), "EEEE, MMMM do")}</span>
                            ) : (
                              <span>Choose a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 shadow-xl border-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate ? new Date(selectedDate) : undefined}
                            onSelect={handleDateSelect}
                            disabled={(date) => isPastDate(date)}
                            className="rounded-lg"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Enhanced Time Selection with Custom Input */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Preferred Time
                      </Label>
                      <div className="space-y-3">
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger className="w-full h-12 border-2 hover:border-sky-300 transition-colors">
                            <SelectValue placeholder="Select a time or choose custom" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                            <SelectItem value="17:00">5:00 PM</SelectItem>
                            <SelectItem value="custom">🕐 Enter custom time</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Custom Time Input */}
                        {selectedTime === "custom" && (
                          <div className="space-y-2 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 shadow-sm">
                            <Label className="text-sm font-medium text-sky-800">Enter your preferred time</Label>
                            <input
                              type="time"
                              className="w-full h-10 px-3 border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                              onChange={(e) => setSelectedTime(e.target.value)}
                              min="08:00"
                              max="18:00"
                            />
                            <p className="text-xs text-sky-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Available between 8:00 AM - 6:00 PM
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Selected date and time display */}
                  {(selectedDate || selectedTime) && (
                    <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl shadow-sm">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-400/80 rounded-full mb-3">
                          <CalendarIcon className="h-6 w-6 text-white" />
                        </div>
                        <h5 className="font-medium text-gray-900 mb-2 text-[18px]">Booking Summary</h5>
                        <div className="space-y-1">
                          <p className="text-gray-700">
                            <span className="font-medium">Date:</span>{" "}
                            {selectedDate ? (
                              <span className="text-sky-500 font-medium">
                                {format(new Date(selectedDate), "EEEE, MMMM do, yyyy")}
                              </span>
                            ) : (
                              <span className="text-gray-500">Not selected</span>
                            )}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Time:</span>{" "}
                            {selectedTime && selectedTime !== "custom" ? (
                              <span className="text-sky-500 font-medium">
                                {selectedTime.includes(":")
                                  ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                  : selectedTime}
                              </span>
                            ) : selectedTime === "custom" ? (
                              <span className="text-sky-700 font-medium">Custom time (please enter above)</span>
                            ) : (
                              <span className="text-gray-500">Not selected</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Continue Button */}
                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => selectedDate && selectedTime && setBookingStep(2)}
                      disabled={!selectedDate || !selectedTime}
                      className={cn(
                        "x-6 py-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors shadow-sm hover:shadow-md",
                        "bg-sky-500 text-white hover:bg-sky-600 cursor-pointer",
                        "disabled:from-sky-600 disabled:hover:cursor-not-allowed",
                      )}
                    >
                      {selectedDate && selectedTime ? (
                        <span className="flex items-center h-30 w-20 text-[15px] text-center justify-center">
                          Continue
                        </span>
                      ) : (
                        "Select Date & Time to Continue"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSeller && bookingStep === 2 && !confirmationStep && !bookingSuccess && (
            <div className="p-6">
              <div className="mb-12">
                <p className="text-gray-600 text-sm flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-sky-600" />
                  <span className="font-medium">Selected date:</span> {formatDate(selectedDate)}
                  {selectedTime && (
                    <>
                      {" at "}
                      {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>

                {/* Worker count information */}
                {selectedSeller.workerCount && (
                  <p className="text-gray-600 text-sm flex items-center mt-2">
                    <Users className="h-4 w-4 mr-2 text-sky-600" />
                    <span className="font-medium">Workers:</span> {selectedSeller.workerCount} worker
                    {selectedSeller.workerCount > 1 ? "s" : ""}
                  </p>
                )}
                {selectedSeller.estimatedTime && (
                  <p className="text-gray-600 text-sm flex items-center mt-2">
                    <Clock className="h-4 w-4 mr-2 text-sky-600" />
                    <span className="font-medium">Estimated time:</span> {selectedSeller.estimatedTime}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-sky-600" /> Select your service location
                </h4>

                {selectedLocation ? (
                  <div className="mt-4 p-4 bg-sky-50 rounded-lg border border-sky-100 mb-4">
                    <h4 className="font-medium mb-2">Selected Location</h4>
                    <p className="text-gray-700 mb-1">{selectedLocation.name}</p>
                    <p className="text-gray-600 text-sm mb-1">
                      Distance from company: {selectedLocation.distance.toFixed(1)} km
                    </p>
                    <p className="text-gray-600 text-sm">
                      Estimated travel time: {selectedLocation.estimatedTime} minutes
                    </p>

                    <div className="mt-4 pt-4 border-t border-sky-200">
                      <h4 className="text-md font-medium mb-2">Pricing Breakdown</h4>
                      <div className="flex justify-between mb-2">
                        <span>Base rate:</span>
                        <span>₱{selectedSeller.startingRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>
                          Distance charge ({selectedLocation.distance.toFixed(1)} km × ₱{selectedSeller.ratePerKm}
                          ):
                        </span>
                        <span>₱{(selectedLocation.distance * selectedSeller.ratePerKm).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-sky-200 my-2"></div>
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total:</span>
                        <span>
                          ₱
                          {totalRate.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Button to change location */}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={openLocationModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Change Location
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-8 bg-gray-50 rounded-lg border border-gray-200 mb-4 text-center">
                    <p className="text-gray-600 mb-4">Please select a location to continue with your booking.</p>
                    <button
                      onClick={openLocationModal}
                      className="px-6 py-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      Select Location
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modify the `confirmationStep` content: */}
          {confirmationStep && (
            <div className="p-6">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-medium">Processing your booking...</p>
                  <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your request.</p>
                </div>
              ) : (
                <>
                  {/* Services Section - Now expandable */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Services:</h3>
                    <Accordion type="single" collapsible defaultValue="item-2">
                      <AccordionItem value="item-1" className="border rounded-lg bg-sky-50 border-sky-200">
                        <AccordionTrigger
                          value="item-2"
                          className="flex justify-between items-center p-4 font-medium text-base text-black hover:no-underline"
                        >
                          <div className="flex-1 text-left">Booking Summary</div>
                          <span className="font-medium text-lg">
                            ₱
                            {totalRate.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0 text-gray-600">
                          <div className="flex justify-between items-center py-2 border-t border-sky-200">
                            <span>Distance:</span>
                            <span className="font-medium">{selectedLocation?.distance.toFixed(1)} km</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-sky-200">
                            <span>Base rate:</span>
                            <span className="font-medium">₱{selectedSeller?.startingRate.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-sky-200">
                            <span>Rate per km:</span>
                            <span className="font-medium">₱{selectedSeller?.ratePerKm.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-sky-200">
                            <span>Distance charge:</span>
                            <span className="font-medium">
                              ₱
                              {selectedLocation
                                ? (selectedLocation.distance * (selectedSeller?.ratePerKm || 0)).toFixed(2)
                                : 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-sky-200 font-medium text-lg">
                            <span>Total:</span>
                            <span>
                              ₱
                              {totalRate.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* More Details Section (formerly Payment Method) */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">More Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{serviceDetails.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-medium">{getSellerName(selectedSeller)}</span>
                        </div>
                        {selectedSeller?.workerCount && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Workers:</span>
                            <span className="font-medium">
                              {selectedSeller.workerCount} worker{selectedSeller.workerCount > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{formatDate(selectedDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">
                            {selectedTime
                              ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                              : "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Service Location:</span>
                          <span className="font-medium">{selectedLocation?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Special Requests</h3>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                      placeholder="Payment request send to the owner. also the stuff assigned."
                      value={specialRequests} // Bind value to state
                      onChange={(e) => setSpecialRequests(e.target.value)} // Update state on change
                    ></textarea>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <p className="text-sm text-yellow-800">
                      By confirming this booking, you agree to the terms and conditions of service. The service provider
                      will contact you shortly to confirm the details.
                    </p>
                  </div>
                </>
              )}

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fadeIn">
                  <p className="text-red-700 flex items-center">
                    <X className="h-5 w-5 mr-2" />
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {bookingSuccess && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="h-8 w-8 text-sky-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Booking Submitted!</h3>

              {selectedSeller && selectedSeller.totalRating === 0 && selectedSeller.reviews === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Gift className="h-5 w-5 text-green-600 mr-2 mb-2" />
                    <p className="text-green-800 font-medium text-sm mb-2">
                      Great news! You can receive a discount coupon for this company after successful booking.
                    </p>
                  </div>
                  {!isCouponClaimed ? (
                    <button
                      onClick={handleClaimCoupon}
                      disabled={isCouponLoading}
                      className={`px-6 py-2 bg-green-500 text-white rounded-full font-medium shadow-sm hover:bg-green-600 active:scale-95 transition-all duration-200 flex items-center gap-2 mx-auto mb-2 ${isCouponLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {isCouponLoading ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Gift className="h-4 w-4" />
                          Claim Free Coupon
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center text-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Coupon Claimed Successfully!</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-600 mb-6">
                Stay tuned! {getSellerName(selectedSeller)} will review and accept your booking soon.
              </p>

              <div className="flex flex-col md:flex-row gap-6 text-left">
                {/* Left side - Booking information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 flex-1 shadow-md relative overflow-hidden">
                  <h4 className="font-medium text-xl text-center mb-10 mt-10 text-gray-700">Booking Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                        <span className="text-sm text-gray-600">Service:</span>
                        <span className="font-medium text-base">{serviceDetails.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                        <span className="text-sm text-gray-600">Provider:</span>
                        <span className="font-medium text-base">{getSellerName(selectedSeller)}</span>
                      </div>
                      {selectedSeller?.workerCount && (
                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                          <span className="text-sm text-gray-600">Workers:</span>
                          <span className="font-medium text-base">
                            {selectedSeller.workerCount} worker{selectedSeller.workerCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="font-medium text-base">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-medium text-base">
                          {selectedTime
                            ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                            : "Not specified"}
                        </span>
                      </div>
                      {/* START: Modified Service Location line */}
                      <div className="flex items-start pb-2 border-b border-dashed border-gray-300">
                        <span className="text-sm text-gray-600 flex-shrink-0 mr-2">Service Location:</span>
                        <span className="font-medium text-base text-right flex-grow">{selectedLocation?.name}</span>
                      </div>
                      {/* END: Modified Service Location line */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Distance:</span>
                        <span className="font-medium text-base">{selectedLocation?.distance.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-lg mb-3 text-gray-800">Estimated Travel Times:</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Light Traffic:</span>{" "}
                        <span className="font-medium text-sky-600">{selectedLocation?.lightTrafficTime} min</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Medium Traffic:</span>{" "}
                        <span className="font-medium text-yellow-600">{selectedLocation?.midTrafficTime} min</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Heavy Traffic:</span>{" "}
                        <span className="font-medium text-orange-600">{selectedLocation?.heavyTrafficTime} min</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Weather Issues:</span>{" "}
                        <span className="font-medium text-red-600">{selectedLocation?.weatherIssuesTime} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Price information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 flex-1 shadow-md relative overflow-hidden">
                  {serviceDetails.image && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={serviceLogo || "/placeholder.svg"}
                        alt={serviceLogo}
                        className="h-40 w-120 mb-[-5px] mt-[-20px] object-contain"
                      />
                    </div>
                  )}
                  {/* <h4 className="font-medium text-xl text-center mb-4 text-gray-700">HandyGo</h4> */}
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Service:</span>
                      <span className="font-medium text-base">{serviceDetails.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Provider:</span>
                      <span className="font-medium text-base">{getSellerName(selectedSeller)}</span>
                    </div>
                    {/* Removed Workers line as requested */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Date:</span>
                      <span className="font-medium text-base">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time:</span>
                      <span className="font-medium text-base">
                        {selectedTime
                          ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-gray-300 my-4"></div>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Base Rate:</span>
                      <span className="font-medium text-base">₱{selectedSeller?.startingRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Distance Charge:</span>
                      <span className="font-medium text-base">
                        ₱
                        {selectedLocation
                          ? (selectedLocation.distance * (selectedSeller?.ratePerKm || 0)).toFixed(2)
                          : 0}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 mt-6 rounded-lg">
                    <div className="flex justify-between items-center font-bold text-xl text-gray-800 mb-2">
                      <span>Total:</span>
                      <span>
                        ₱{totalRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 text-sm">
                      <span>Payment Status:</span>
                      <span>Pending</span> {/* Placeholder for payment status */}
                    </div>
                  </div>
                  {/* QR Code Section */}
                  <div className="flex items-center justify-between mt-8 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200">
                    <div className="text-gray-700 text-sm pr-4">
                      <h5 className="font-medium mb-1 text-sky-800">Download Your Receipt</h5>
                      <p className="text-xs text-gray-600">Scan QR code to download booking details</p>
                    </div>
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl || "/placeholder.svg"}
                        alt="Receipt QR Code"
                        className="w-24 h-24 border-2 border-sky-300 rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-500">Loading...</span>
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="mt-8 text-xs text-gray-500 text-center">
                    <p>HandyGO Inc.</p>
                    <p>TIN: 1234567890</p>
                    <a
                      href="https://ohs-one.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline mt-1 block"
                    >
                      Check receipt: ohs-one.vercel.app
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer section with action buttons - fixed at bottom */}
        <div className="p-6 border-t border-gray-100/50 mt-auto bg-gray-50/80 backdrop-blur-sm">
          {bookingStep === 0 && !selectedSeller && !bookingSuccess && !confirmationStep && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors shadow-sm hover:shadow-md"
              >
                Close
              </button>
            </div>
          )}

          {bookingStep === 2 && selectedSeller && !confirmationStep && !bookingSuccess && (
            <div className="flex justify-end">
              <button
                onClick={handleBookNow}
                disabled={!selectedLocation}
                className={`px-6 py-2 rounded-full transition-colors ${selectedLocation
                    ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sm hover:shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Book Now
              </button>
            </div>
          )}

          {/* Update the footer buttons for `confirmationStep`: */}
          {confirmationStep && (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-700 hover:shadow-md"
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Processing...
                  </span>
                ) : (
                  "Send a Request & Confirm Booking"
                )}
              </button>
              <button
                onClick={() => setConfirmationStep(false)}
                disabled={isSubmitting}
                className={`text-gray-500 hover:text-gray-700 transition-colors ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Wait, I want to review again
              </button>
            </div>
          )}

          {bookingSuccess && (
            <div className="flex justify-end">
              <button
                onClick={resetBooking}
                className="px-6 py-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors shadow-sm hover:shadow-md"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>

      {hoveredSeller && (
        <CompanyPreview
          seller={hoveredSeller}
          isVisible={true}
          position={hoverPosition}
          onMouseLeave={handlePreviewLeave}
        />
      )}

      {isLocationModalOpen && (
        <LocationSelectionModal
          isOpen={isLocationModalOpen}
          onClose={closeLocationModal}
          onSelectLocation={selectLocation}
          companyLocation={COMPANY_LOCATION}
          previousLocation={selectedLocation}
        />
      )}
      {isErrorModalOpen && errorMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 animate-pulse">
                <X className="h-10 w-10 text-red-500 animate-bounceIn" />
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-2 animate-slideInUp">Booking Failed</h3>

              <p className="text-gray-600 mb-6 animate-fadeIn">{errorMessage}</p>

              <button
                onClick={handleErrorModalClose}
                className="px-8 py-3 bg-red-500 text-white rounded-full font-medium shadow-sm hover:bg-red-600 active:scale-95 transition-all duration-200 animate-fadeIn"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {isCouponSuccessModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
            style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
                Coupon Claimed Successfully!
              </h3>

              <p className="text-gray-600 mb-4" style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}>
                Your discount coupon has been added to your account. You can use it for future bookings with{" "}
                {getSellerName(selectedSeller)}.
              </p>

              {claimedCouponData && (
                <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Coupon Code:</span>
                      <span className="font-bold text-green-700 text-lg">{claimedCouponData.code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        {claimedCouponData.discountValue}% off
                        {claimedCouponData.maxDiscount && ` (up to ₱${claimedCouponData.maxDiscount})`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valid Until:</span>
                      <span className="font-medium text-gray-700">
                        {new Date(claimedCouponData.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                    {claimedCouponData.minPurchase > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Min. Purchase:</span>
                        <span className="font-medium text-gray-700">₱{claimedCouponData.minPurchase}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div
                className="flex items-center gap-2 text-green-600"
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                <Gift className="h-5 w-5" />
                <span className="font-medium">Enjoy your savings!</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkersModal