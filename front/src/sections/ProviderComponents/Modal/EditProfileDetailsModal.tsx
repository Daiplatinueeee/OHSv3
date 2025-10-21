import React, { useState, useEffect, useCallback } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react"
import axios from "axios"
import LocationSelector from "../../Styles/LocationSelectorAuth"
import OTP from "../../Styles/OTP"

// New component for the final success modal
interface ProfileUpdateSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

const ProfileUpdateSuccessModal: React.FC<ProfileUpdateSuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        {" "}
        {/* Higher z-index than main modal */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Check className="h-10 w-10 text-green-500 animate-bounce" />
                </div>
                <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-700 mb-2">
                  Profile Updated!
                </Dialog.Title>
                <p className="text-gray-600 text-center mb-6">Your profile details have been successfully updated.</p>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                  onClick={onClose}
                >
                  Got it!
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

interface Location {
  name: string
  lat: number
  lng: number
  distance: number
  price?: number
  id?: string
  zipCode?: string
}

const companyLocation = {
  lat: 10.3125,
  lng: 123.8924,
}

const initialSavedLocations: Location[] = []

interface UserDetails {
  _id: string
  firstName: string
  lastName: string
  middleName?: string
  email: string
  mobileNumber: string
  gender?: string
  bio?: string
  profilePicture?: string
  coverPhoto?: string
  location?: {
    name: string
    lat: number
    lng: number
    distance: number
    zipCode?: string
  }
  type: string
  status: string
  verification: string
  createdAt: string
}

interface EditProfileDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userDetails: UserDetails | null
  onSaveSuccess: (updatedUser: UserDetails) => void
}

export function EditProfileDetailsModal({ isOpen, onClose, userDetails, onSaveSuccess }: EditProfileDetailsModalProps) {
  const [editedDetails, setEditedDetails] = useState<Partial<UserDetails>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState("next")

  // New state for OTP and success flow
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showFinalSuccessModal, setShowFinalSuccessModal] = useState(false)
  const [emailToVerify, setEmailToVerify] = useState("")
  const [originalEmail, setOriginalEmail] = useState("")
  const [, setPendingProfileUpdate] = useState<Partial<UserDetails> | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  // NEW: State for email validation status
  const [emailValidationStatus, setEmailValidationStatus] = useState<"idle" | "checking" | "available" | "unavailable">(
    "idle",
  )

  useEffect(() => {
    if (userDetails) {
      setEditedDetails({
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        middleName: userDetails.middleName,
        email: userDetails.email,
        mobileNumber: userDetails.mobileNumber,
        gender: userDetails.gender,
        bio: userDetails.bio,
        location: userDetails.location ? { ...userDetails.location } : undefined,
      })
      setSelectedLocation(userDetails.location ? { ...userDetails.location } : null)
      setOriginalEmail(userDetails.email) // Set original email
      setCurrentStep(1) // Reset step on new userDetails
      // Reset all modal states when main modal opens/closes or userDetails change
      setShowOtpModal(false)
      setShowFinalSuccessModal(false)
      setEmailToVerify("")
      setPendingProfileUpdate(null)
      setSaveError(null) // Clear errors
      setEmailError(null) // NEW: Clear email specific errors
      setEmailValidationStatus("idle") // NEW: Reset email validation status
    }
  }, [userDetails, isOpen])

  const handleLocationSelect = (location: Location) => {
    const updatedLocation = {
      ...location,
    }
    setSelectedLocation(updatedLocation)
    setEditedDetails((prev) => ({
      ...prev,
      location: updatedLocation,
    }))
    setShowLocationModal(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditedDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
    // NEW: Clear email error and reset status if the email field is being edited
    if (name === "email") {
      setEmailError(null)
      setEmailValidationStatus("idle")
    }
  }

  const API_BASE_URL = "http://localhost:3000"

  // NEW: Generic function to send email verification code
  const sendVerificationCode = useCallback(async (email: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token") // Assuming token is stored here
      if (!token) {
        setSaveError("Authentication token missing. Please log in again.")
        return false
      }
      const response = await axios.post(
        `${API_BASE_URL}/api/users/send-email-verification`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Authenticate this request if needed, though the endpoint itself doesn't require it
          },
        },
      )
      return response.status === 200
    } catch (error) {
      console.error("Error sending verification code:", error)
      setSaveError("Failed to send verification code. Please try again.")
      return false
    }
  }, [])

  // NEW: Modified handleOtpAndRecaptchaSuccess to handle the new email verification flow
  const handleEmailVerificationSuccess = useCallback(
    async (data: { user: UserDetails; token?: string }) => {
      setIsSaving(true)
      setSaveError(null)
      setShowOtpModal(false) // Close OTP modal

      // The `data.user` here should already contain the updated email from the backend's verifyEmailVerificationCode
      onSaveSuccess(data.user)
      setShowFinalSuccessModal(true) // Show final success modal

      // Automatically close success modal and main modal after a delay
      setTimeout(() => {
        setShowFinalSuccessModal(false)
        onClose()
      }, 2000) // Adjust delay as needed
      setIsSaving(false)
      setPendingProfileUpdate(null) // Clear pending update
    },
    [onSaveSuccess, onClose],
  )

  const handleEmailBlur = async () => {
    const currentEmail = editedDetails.email || ""

    // Only validate if email has changed and is not empty
    if (currentEmail === originalEmail) {
      setEmailError(null)
      setEmailValidationStatus("available") // It's the current email, so it's available for this user
      return true // No change, no error
    }

    if (!currentEmail) {
      setEmailError("Email cannot be empty.")
      setEmailValidationStatus("unavailable")
      return false
    }

    if (!/\S+@\S+\.\S+/.test(currentEmail)) {
      setEmailError("Please enter a valid email address.")
      setEmailValidationStatus("unavailable")
      return false
    }

    setIsCheckingEmail(true)
    setEmailError(null) // Clear previous errors before checking
    setEmailValidationStatus("checking")

    try {
      const token = localStorage.getItem("token") // Assuming token is stored here
      if (!token) {
        setEmailError("Authentication token missing. Please log in again.")
        setEmailValidationStatus("unavailable")
        return false
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/users/check-email-availability`,
        { email: currentEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.available === false) {
        setEmailError(response.data.message || "This email is already in use by another account.")
        setEmailValidationStatus("unavailable")
        return false
      } else {
        setEmailError(null) // Email is available
        setEmailValidationStatus("available")
        return true
      }
    } catch (error: any) {
      console.error("Error checking email availability:", error)
      setEmailError(error.response?.data?.message || "Network error while checking email availability.")
      setEmailValidationStatus("unavailable")
      return false
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    // Perform email validation on save attempt
    const isEmailValid = await handleEmailBlur()
    if (!isEmailValid) {
      setIsSaving(false) // Stop saving if email is invalid
      setSaveError("Please fix the email error before saving.")
      return
    }

    // If email has changed and is valid/available, trigger the new verification flow
    if (editedDetails.email && editedDetails.email !== originalEmail) {
      setEmailToVerify(editedDetails.email)
      setPendingProfileUpdate(editedDetails) // Store all edited details for later
      const codeSent = await sendVerificationCode(editedDetails.email) // Use the new sendVerificationCode
      if (codeSent) {
        setShowOtpModal(true) // Show the OTP modal for verification
        setIsSaving(false) // Stop saving animation, OTP modal will handle its own loading
        return // Prevent immediate profile update
      } else {
        // sendVerificationCode already sets saveError
        setIsSaving(false)
        return
      }
    }

    // If email has not changed, or if it's the same email, proceed with direct save of other fields
    setIsSaving(true)
    setSaveError(null)
    const token = localStorage.getItem("token")

    if (!token) {
      setSaveError("Authentication token missing. Please log in.")
      setIsSaving(false)
      return
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, editedDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      onSaveSuccess(response.data.user)
      setShowFinalSuccessModal(true) // Show success modal
      setTimeout(() => {
        // Auto-close success modal and main modal
        setShowFinalSuccessModal(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error("Error saving user details:", err)
      if (err.response && err.response.data && err.response.data.message) {
        setSaveError(`Failed to save changes: ${err.response.data.message}`)
      } else {
        setSaveError("Failed to save changes. Please try again.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const goToNextStep = () => {
    setAnimationDirection("next")
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1)
      setTimeout(() => setIsAnimating(false), 50)
    }, 250)
  }

  const goToPreviousStep = () => {
    setAnimationDirection("prev")
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1)
      setTimeout(() => setIsAnimating(false), 50)
    }, 250)
  }

  // Determine border color class for email input
  const emailBorderClass =
    emailValidationStatus === "available"
      ? "border-green-500 focus:ring-green-500"
      : emailValidationStatus === "unavailable"
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-sky-500"

  return (
    <>
      <Transition appear show={isOpen} as={React.Fragment}>
        {/* Modified onClose prop: prevents closing when OTP modal is visible */}
        <Dialog as="div" className="relative z-50" onClose={showOtpModal ? () => {} : onClose}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-700">
                      Edit Account Details
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={onClose}
                      aria-label="Close"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {saveError && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                      role="alert"
                    >
                      <strong className="font-bold">Error:</strong>
                      <span className="block sm:inline"> {saveError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSave} className="flex flex-col flex-grow">
                    <div
                      className={`flex-grow overflow-y-auto pr-2 space-y-6 transition-all duration-300 ${
                        isAnimating
                          ? animationDirection === "next"
                            ? "opacity-0 translate-x-10"
                            : "opacity-0 -translate-x-10"
                          : "opacity-100 translate-x-0"
                      }`}
                    >
                      {/* Page 1: Personal Info */}
                      {currentStep === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={editedDetails.firstName || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                              Middle Name (Optional)
                            </label>
                            <input
                              type="text"
                              id="middleName"
                              name="middleName"
                              value={editedDetails.middleName || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={editedDetails.lastName || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              id="mobileNumber"
                              name="mobileNumber"
                              value={editedDetails.mobileNumber || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            <select
                              id="gender"
                              name="gender"
                              value={editedDetails.gender || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                              Bio
                            </label>
                            <textarea
                              id="bio"
                              name="bio"
                              value={editedDetails.bio || ""}
                              onChange={handleInputChange}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Page 2: Location */}
                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium mb-2 text-gray-700">Select Your Location</h4>
                          <button
                            type="button"
                            onClick={() => setShowLocationModal(true)}
                            className="w-full px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors shadow-sm"
                          >
                            Open Location Selector
                          </button>
                          <div className="p-4 bg-gray-50 rounded-lg mt-2">
                            {!selectedLocation && (
                              <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-400">No location selected</p>
                              </div>
                            )}
                          </div>
                          {selectedLocation && (
                            <div className="p-4 bg-white border rounded-lg shadow-sm mt-2">
                              <h4 className="font-medium mb-2">Selected Location</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-gray-500">Location Name</label>
                                  <p className="font-medium text-gray-800">{selectedLocation.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs text-gray-500">Distance</label>
                                    <p className="font-medium text-gray-800">
                                      {selectedLocation.distance.toFixed(1)} km
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500">Zip Code</label>
                                    <p className="font-medium text-gray-800">
                                      {selectedLocation.zipCode ? (
                                        selectedLocation.zipCode
                                      ) : (
                                        <span className="text-gray-400">Not available</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Coordinates</label>
                                  <p className="text-sm text-gray-800">
                                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Page 3: Email */}
                      {currentStep === 3 && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium mb-2 text-gray-700">Email Address</h4>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={editedDetails.email || ""}
                              onChange={handleInputChange}
                              onBlur={handleEmailBlur} // NEW: Add onBlur handler
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${emailBorderClass}`} // NEW: Dynamic border class
                              required
                              disabled={isCheckingEmail || isSaving} // NEW: Disable input during check/save
                            />
                            {isCheckingEmail && ( // NEW: Loading indicator for email check
                              <p className="text-sm text-gray-500 mt-1 flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking availability...
                              </p>
                            )}
                            {emailValidationStatus === "available" &&
                              !isCheckingEmail && ( // NEW: Success message
                                <p className="text-sm text-green-500 mt-1 flex items-center">
                                  <Check className="mr-2 h-4 w-4" /> Email is available!
                                </p>
                              )}
                            {emailValidationStatus === "unavailable" &&
                              emailError && ( // NEW: Error message
                                <p className="text-sm text-red-500 mt-1 flex items-center">
                                  <X className="mr-2 h-4 w-4" /> {emailError}
                                </p>
                              )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-between gap-3">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        disabled={currentStep === 1}
                        className={`group px-4 py-2 flex items-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 ${
                          currentStep === 1 ? "opacity-0 pointer-events-none" : "hover:shadow-sm"
                        }`}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        <span>Back</span>
                      </button>

                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={goToNextStep}
                          className="group px-4 py-2 flex items-center rounded-full text-white transition-all duration-300 bg-sky-500 hover:bg-sky-600 hover:shadow-md"
                        >
                          <span>Next</span>
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all flex items-center justify-center shadow-sm"
                          disabled={isSaving || isCheckingEmail || emailValidationStatus === "unavailable"} // NEW: Disable if email is unavailable
                        >
                          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                        </button>
                      )}
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>

          {/* Location selection modal */}
          {showLocationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowLocationModal(false)}></div>
              <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-auto p-4 z-10">
                <LocationSelector
                  isOpen={showLocationModal}
                  onClose={() => {
                    console.log("LocationSelectorAuth: onClose called from parent")
                    setShowLocationModal(false)
                  }}
                  onSelectLocation={handleLocationSelect}
                  companyLocation={companyLocation}
                  savedLocations={initialSavedLocations}
                  previousLocation={selectedLocation}
                />
              </div>
            </div>
          )}
        </Dialog>
      </Transition>

      {/* OTP Verification Modal */}
      <OTP
        visible={showOtpModal}
        email={emailToVerify}
        onClose={() => {
          setShowOtpModal(false)
          setSaveError("Email verification cancelled.") // Optionally set an error if user closes OTP modal
          setIsSaving(false) // Ensure saving state is reset
        }}
        onOtpVerifiedSuccess={handleEmailVerificationSuccess} // NEW: Use the new success handler
        onResendOtp={sendVerificationCode} // NEW: Use the new send function
        // REMOVED: apiBaseUrl prop
      />

      {/* Final Success Modal */}
      <ProfileUpdateSuccessModal isOpen={showFinalSuccessModal} onClose={() => setShowFinalSuccessModal(false)} />
    </>
  )
}