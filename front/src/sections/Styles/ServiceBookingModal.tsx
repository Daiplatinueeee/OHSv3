import { useState, useEffect } from "react"
import { X, Calendar, Clock, MapPin, Check, ArrowLeft, CheckCircle2, Gift } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Service {
  id: string
  name: string
  price: number
  description: string
  image: string
  chargePerKm: number
  cooId?: string
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

interface ServiceBookingModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
  seller: any
}

// Mock locations for demo - in real app this would come from a location service
const MOCK_LOCATIONS: Location[] = [
  {
    name: "Cebu IT Park, Lahug, Cebu City",
    lat: 10.3157,
    lng: 123.8854,
    distance: 2.5,
    lightTrafficTime: 8,
    midTrafficTime: 12,
    heavyTrafficTime: 18,
    weatherIssuesTime: 25,
  },
  {
    name: "Ayala Center Cebu, Cebu Business Park",
    lat: 10.3181,
    lng: 123.9058,
    distance: 3.2,
    lightTrafficTime: 10,
    midTrafficTime: 15,
    heavyTrafficTime: 22,
    weatherIssuesTime: 30,
  },
  {
    name: "SM City Cebu, North Reclamation Area",
    lat: 10.3369,
    lng: 123.9233,
    distance: 4.1,
    lightTrafficTime: 12,
    midTrafficTime: 18,
    heavyTrafficTime: 28,
    weatherIssuesTime: 35,
  },
]

export default function ServiceBookingModal({ isOpen, onClose, service, seller }: ServiceBookingModalProps) {
  const [bookingStep, setBookingStep] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [totalRate, setTotalRate] = useState<number>(0)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [confirmationStep, setConfirmationStep] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [specialRequests, setSpecialRequests] = useState<string>("")
  const [isCouponClaimed, setIsCouponClaimed] = useState<boolean>(false)
  const [isCouponSuccessModalOpen, setIsCouponSuccessModalOpen] = useState<boolean>(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false)

  useEffect(() => {
    if (service) {
      setTotalRate(service.price)
    }
  }, [service])

  useEffect(() => {
    if (selectedLocation && service) {
      const newTotalRate = service.price + selectedLocation.distance * service.chargePerKm
      setTotalRate(newTotalRate)
    }
  }, [selectedLocation, service])

  if (!isOpen || !service) return null

  const resetBooking = () => {
    setBookingStep(1)
    setSelectedDate("")
    setSelectedTime("")
    setSelectedLocation(null)
    setConfirmationStep(false)
    setBookingSuccess(false)
    setSpecialRequests("")
    setIsCouponClaimed(false)
    setIsCouponSuccessModalOpen(false)
    setTotalRate(service?.price || 0)
  }

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

  const getUserAuthData = () => {
    try {
      const userString = localStorage.getItem("user")
      const token = localStorage.getItem("token")

      if (!userString || !token) {
        return { userId: null, token: null, firstname: "User" }
      }

      const userData = JSON.parse(userString)
      let userId = null
      let firstname = "User"

      if (userData._id) {
        userId = userData._id
        firstname = userData.firstname || firstname
      } else if (userData.id) {
        userId = userData.id
        firstname = userData.firstname || firstname
      }

      return { userId, token, firstname }
    } catch (error) {
      console.error("Error parsing user data:", error)
      return { userId: null, token: null, firstname: "User" }
    }
  }

  const submitBookingToDatabase = async () => {
    if (!service || !selectedLocation || !selectedDate || !selectedTime) {
      console.error("Missing required booking information")
      return { success: false, error: "Missing required booking information" }
    }

    try {
      const { userId, token, firstname } = getUserAuthData()

      if (!userId || !token) {
        return {
          success: false,
          error: "Authentication required. Please log in again.",
          authError: true,
        }
      }

      const distanceCharge = selectedLocation.distance * service.chargePerKm

      const bookingData = {
        userId,
        firstname,
        productName: service.name,
        serviceImage: service.image,
        providerName: seller?.name || seller?.businessName || "Service Provider",
        providerId: seller?.id || seller?._id,
        workerCount: 1,
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
          baseRate: service.price,
          distanceCharge: distanceCharge,
          totalRate: totalRate,
        },
        specialRequests: specialRequests,
      }

      const response = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))

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

      // Create booking notification
      try {
        const notificationData = {
          userId,
          bookingId: result._id,
          status: "pending",
          serviceName: service.name,
          providerName: seller?.name || seller?.businessName || "Service Provider",
        }

        await fetch("http://localhost:3000/notifications/booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(notificationData),
        }).catch((err) => {
          console.error("Error creating notification:", err)
        })
      } catch (notificationError) {
        console.error("Error creating booking notification:", notificationError)
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

        if (authError) {
          console.error("Authentication error during booking")
        }
      }
    } catch (error) {
      console.error("Error during booking confirmation:", error)
      setIsSubmitting(false)
      setErrorMessage("An unexpected error occurred. Please try again.")
      setIsErrorModalOpen(true)
    }
  }

  const handleErrorModalClose = () => {
    setIsErrorModalOpen(false)
    setErrorMessage(null)
  }

  const handleClaimCoupon = () => {
    setIsCouponClaimed(true)
    setIsCouponSuccessModalOpen(true)

    setTimeout(() => {
      setIsCouponSuccessModalOpen(false)
    }, 3000)
  }

  const openLocationModal = () => {
    setIsLocationModalOpen(true)
  }

  const closeLocationModal = () => {
    setIsLocationModalOpen(false)
  }

  const selectLocation = (location: Location) => {
    const estimatedTimeInMinutes = Math.round(location.distance * 2)
    const locationWithTime = {
      ...location,
      estimatedTime: estimatedTimeInMinutes,
    }
    setSelectedLocation(locationWithTime)
    setIsLocationModalOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/40">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100/50 bg-white/80 backdrop-blur-sm">
          {bookingStep === 1 && !confirmationStep && !bookingSuccess && (
            <>
              <div>
                <h2 className="text-[19px] font-medium text-gray-700">Schedule your service</h2>
                <p className="mt-1 text-[14.5px] mb-8 text-gray-500/80 font-normal">
                  Please choose your preferred date and time for the service. Our team will review your request and
                  confirm if the booking is available
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </>
          )}

          {bookingStep === 2 && !confirmationStep && !bookingSuccess && (
            <>
              <div>
                <button
                  onClick={() => setBookingStep(1)}
                  className="flex items-center text-sky-600 hover:text-sky-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to date selection
                </button>
                <h2 className="text-[19px] font-medium text-gray-700 mt-5">Select Service Location</h2>
                <p className="mt-1 text-[14.5px] mb-8 text-gray-500/80 font-normal">
                  Please provide the exact address so company providers can reach you without any delays.
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </>
          )}

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

        {/* Content */}
        <div className="overflow-y-auto flex-grow bg-white">
          {/* Step 1: Date & Time Selection */}
          {bookingStep === 1 && !confirmationStep && !bookingSuccess && (
            <div className="p-8 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl max-w-4xl mx-auto">
              {/* Service Header */}
              <div className="mb-8">
                <div className="flex flex-col items-center gap-4 mb-6 text-center justify-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[22px] font-medium text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 leading-relaxed mb-5">{service.description}</p>
                  </div>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="mb-8">
                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
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
                            <Calendar className="mr-3 h-4 w-4 text-sky-600" />
                            {selectedDate ? (
                              <span className="font-medium">{format(new Date(selectedDate), "EEEE, MMMM do")}</span>
                            ) : (
                              <span>Choose a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 shadow-xl border-0">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate ? new Date(selectedDate) : undefined}
                            onSelect={handleDateSelect}
                            disabled={(date) => isPastDate(date)}
                            className="rounded-lg"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Selection */}
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

                  {/* Booking Summary */}
                  {(selectedDate || selectedTime) && (
                    <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl shadow-sm">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-400/80 rounded-full mb-3">
                          <Calendar className="h-6 w-6 text-white" />
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

                  {/* Continue Button */}
                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => selectedDate && selectedTime && setBookingStep(2)}
                      disabled={!selectedDate || !selectedTime}
                      className={cn(
                        "px-6 py-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors shadow-sm hover:shadow-md",
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

          {/* Step 2: Location Selection */}
          {bookingStep === 2 && !confirmationStep && !bookingSuccess && (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                <p className="text-gray-600 text-sm flex items-center mt-5">
                  <Calendar className="h-4 w-4 mr-2 text-sky-600" />
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
                        <span>₱{service.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>
                          Distance charge ({selectedLocation.distance.toFixed(1)} km × ₱{service.chargePerKm})
                        </span>
                        <span>₱{(selectedLocation.distance * service.chargePerKm).toFixed(2)}</span>
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

          {/* Confirmation Step */}
          {confirmationStep && (
            <div className="p-6">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-medium">Processing your booking...</p>
                  <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your request.</p>
                </div>
              ) : (
                <>
                  {/* Services Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Services:</h3>
                    <Accordion type="single" collapsible defaultValue="item-2">
                      <AccordionItem value="item-1" className="border rounded-lg bg-sky-50 border-sky-200">
                        <AccordionTrigger className="flex justify-between items-center p-4 font-medium text-base text-black hover:no-underline">
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
                            <span className="font-medium">₱{service.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-sky-200">
                            <span>Rate per km:</span>
                            <span className="font-medium">₱{service.chargePerKm.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-sky-200">
                            <span>Distance charge:</span>
                            <span className="font-medium">
                              ₱{selectedLocation ? (selectedLocation.distance * service.chargePerKm).toFixed(2) : 0}
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

                  {/* More Details Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">More Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-medium">
                            {seller?.name || seller?.businessName || "Service Provider"}
                          </span>
                        </div>
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
                      placeholder="Any special requests or notes for the service provider..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 flex items-center">
                    <X className="h-5 w-5 mr-2" />
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success Step */}
          {bookingSuccess && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="h-8 w-8 text-sky-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Booking Submitted!</h3>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Gift className="h-5 w-5 text-green-600 mr-2 mb-2" />
                  <p className="text-green-800 font-medium text-sm mb-2">
                    Great news! You can receive a discount coupon for this service after successful booking.
                  </p>
                </div>
                {!isCouponClaimed ? (
                  <button
                    onClick={handleClaimCoupon}
                    className="px-6 py-2 bg-green-500 text-white rounded-full font-medium shadow-sm hover:bg-green-600 active:scale-95 transition-all duration-200 flex items-center gap-2 mx-auto mb-2"
                  >
                    <Gift className="h-4 w-4" />
                    Claim Free Coupon
                  </button>
                ) : (
                  <div className="flex items-center justify-center text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Coupon Claimed Successfully!</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-6">
                Stay tuned! The service provider will review and accept your booking soon.
              </p>

              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-md">
                <h4 className="font-medium text-xl text-center mb-4 text-gray-700">Booking Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                      <span className="text-sm text-gray-600">Service:</span>
                      <span className="font-medium text-base">{service.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                      <span className="text-sm text-gray-600">Provider:</span>
                      <span className="font-medium text-base">
                        {seller?.name || seller?.businessName || "Service Provider"}
                      </span>
                    </div>
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
                    <div className="flex items-start pb-2 border-b border-dashed border-gray-300">
                      <span className="text-sm text-gray-600 flex-shrink-0 mr-2">Service Location:</span>
                      <span className="font-medium text-base text-right flex-grow">{selectedLocation?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Distance:</span>
                      <span className="font-medium text-base">{selectedLocation?.distance.toFixed(1)} km</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center font-bold text-xl text-gray-800 mb-2">
                    <span>Total:</span>
                    <span>
                      ₱{totalRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>Payment Status:</span>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100/50 mt-auto bg-gray-50/80 backdrop-blur-sm">
          {bookingStep === 2 && !confirmationStep && !bookingSuccess && (
            <div className="flex justify-end">
              <button
                onClick={() => setConfirmationStep(true)}
                disabled={!selectedLocation}
                className={`px-6 py-2 rounded-full transition-colors ${
                  selectedLocation
                    ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sm hover:shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Book Now
              </button>
            </div>
          )}

          {confirmationStep && (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-700 hover:shadow-md"
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
                className={`text-gray-500 hover:text-gray-700 transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
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

      {/* Location Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Select Service Location</h3>
                <button onClick={closeLocationModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {MOCK_LOCATIONS.map((location, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 cursor-pointer transition-colors"
                    onClick={() => selectLocation(location)}
                  >
                    <h4 className="font-medium mb-2">{location.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Distance: {location.distance.toFixed(1)} km</p>
                      <div className="flex justify-between">
                        <span>Light Traffic: {location.lightTrafficTime} min</span>
                        <span>Heavy Traffic: {location.heavyTrafficTime} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && errorMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 animate-pulse">
                <X className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Booking Failed</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={handleErrorModalClose}
                className="px-8 py-3 bg-red-500 text-white rounded-full font-medium shadow-sm hover:bg-red-600 active:scale-95 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Success Modal */}
      {isCouponSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Coupon Claimed Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your discount coupon has been added to your account. You can use it for future bookings.
              </p>
              <div className="flex items-center gap-2 text-green-600">
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