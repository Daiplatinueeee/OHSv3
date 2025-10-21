import React, { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { Dialog, Transition } from "@headlessui/react"
import {
  MapPin,
  Camera,
  X,
  Loader2,
  Check,
  User,
  Mail,
  Phone,
  Calendar,
  MoonIcon as Venus,
  Text,
  Building2,
  Briefcase,
  ImageIcon,
  CalendarDays,
  Lock,
  Upload,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react"

import MyFloatingDockCustomer from "../Styles/MyFloatingDock-Provider"
import LocationSelector from "../Styles/LocationSelectionModal"
import OTP from "../Styles/OTP"
import ImagePopup from "../Styles/ImagePopup"

interface ProfileUpdateSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

// Animation keyframes from Transaction.tsx
const keyframes = `
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

const ProfileUpdateSuccessModal: React.FC<ProfileUpdateSuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />
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
              {/* Redesigned modal panel */}
              <Dialog.Panel
                className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
                style={{ animation: "fadeIn 0.5s ease-out" }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
                    style={{ animation: "pulse 2s ease-in-out infinite" }}
                  >
                    <CheckCircle2
                      className="h-10 w-10 text-green-500"
                      style={{ animation: "bounceIn 0.6s ease-out" }}
                    />
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium text-gray-900 mb-2"
                    style={{ animation: "slideInUp 0.4s ease-out" }}
                  >
                    Profile Updated!
                  </Dialog.Title>

                  <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                    Your profile details have been successfully updated.
                  </p>

                  <button
                    type="button"
                    className="px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                    onClick={onClose}
                    style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
                  >
                    Got it!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// NEW: Account Observation Modal Component
const AccountObservationModal: React.FC<ProfileUpdateSuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
              <Dialog.Panel
                className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
                style={{ animation: "fadeIn 0.5s ease-out" }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6"
                    style={{ animation: "pulse 2s ease-in-out infinite" }}
                  >
                    <AlertTriangle
                      className="h-10 w-10 text-yellow-500"
                      style={{ animation: "bounceIn 0.6s ease-out" }}
                    />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium text-gray-900 mb-2"
                    style={{ animation: "slideInUp 0.4s ease-out" }}
                  >
                    Account Under Observation
                  </Dialog.Title>
                  <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                    Your account is now under observation. We will verify your account once all documents are approved.
                  </p>
                  <button
                    type="button"
                    className="px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                    onClick={onClose}
                    style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
                  >
                    Got it!
                  </button>
                </div>
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
  name: "HandyGo Headquarters",
}

const initialSavedLocations: Location[] = []

interface PersonalInfo {
  id: number
  type: string
  title: string
  description: string
  startDate?: string
  endDate?: string
  location?: string
  organization?: string
  hasNotification?: boolean
  notificationCount?: number
  image?: string
}

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
  accountType: string // Changed from 'type' to 'accountType'
  status: string
  isVerified: boolean // Changed from 'verification: string' to 'isVerified: boolean'
  createdAt: string
  idDocuments?: {
    front?: string
    back?: string
  }
  secretQuestion?: string
  secretAnswer?: string
  secretCode?: string
}

function MyProfile() {
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedInfo] = useState<PersonalInfo | null>(null)
  const [editedInfo, setEditedInfo] = useState<Partial<PersonalInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false)
  const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false)
  const [originalProfilePicture, setOriginalProfilePicture] = useState<string | undefined>(undefined)
  const [originalCoverPhoto, setOriginalCoverPhoto] = useState<string | undefined>(undefined)
  const [isResettingImages, setIsResettingImages] = useState(false)

  // NEW states for inline editing of profile details
  const [isEditingDetails, setIsEditingDetails] = useState(false) // Replaces isEditDetailsModalOpen
  const [editedDetails, setEditedDetails] = useState<Partial<UserDetails>>({})
  const [isSavingDetails, setIsSavingDetails] = useState(false) // Renamed from isSaving
  const [saveDetailsError, setSaveDetailsError] = useState<string | null>(null) // Renamed from saveError
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showFinalSuccessModal, setShowFinalSuccessModal] = useState(false)
  const [emailToVerify, setEmailToVerify] = useState("")
  const [originalEmail, setOriginalEmail] = useState("")
  const [, setPendingProfileUpdate] = useState<Partial<UserDetails> | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false)
  const [emailValidationStatus, setEmailValidationStatus] = useState<"idle" | "checking" | "available" | "unavailable">(
    "idle",
  )

  // NEW: States for ID documents and secret question/answer
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null)
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null)
  const [secretQuestion, setSecretQuestion] = useState("")
  const [secretAnswer, setSecretAnswer] = useState("")
  const [secretCode, setSecretCode] = useState<string | null>(null)
  // State for toggling visibility of secret answer
  const [showSecretAnswerInput, setShowSecretAnswerInput] = useState(false)
  const [showSecretAnswerView, setShowSecretAnswerView] = useState(false)

  // NEW: States for upload modals and image popup
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [currentFileInputRef, setCurrentFileInputRef] = useState<HTMLInputElement | null>(null)
  const [hasWarningBeenShownOnce, setHasWarningBeenShownOnce] = useState(false)
  const [showFileExistsModal, setShowFileExistsModal] = useState(false)
  const [showGenericUploadErrorModal, setShowGenericUploadErrorModal] = useState(false)
  const [genericUploadErrorMessage, setGenericUploadErrorMessage] = useState("")
  const [popupImage, setPopupImage] = useState<string | null>(null)
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false)
  // NEW: State for account observation modal
  const [showObservationModal, setShowObservationModal] = useState(false)

  // NEW: Refs for file inputs
  const frontIdRef = useRef<HTMLInputElement>(null)
  const backIdRef = useRef<HTMLInputElement>(null)

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo[]>([])

  // Generate secret code based on question and answer
  useEffect(() => {
    const generateSecretCode = async () => {
      if (secretQuestion.trim() !== "" && secretAnswer.trim() !== "") {
        const combinedString = secretQuestion.trim() + secretAnswer.trim()
        const textEncoder = new TextEncoder()
        const data = textEncoder.encode(combinedString)
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
        setSecretCode(hexHash.substring(0, 10)) // Use first 10 characters of the hash
      } else {
        setSecretCode(null) // Clear code if inputs are empty
      }
    }

    if (isEditingDetails) {
      generateSecretCode()
    }
  }, [secretQuestion, secretAnswer, isEditingDetails])

  // Load warning status from localStorage on mount
  useEffect(() => {
    const warningStatus = localStorage.getItem("v0_id_upload_warning_shown")
    if (warningStatus === "true") {
      setHasWarningBeenShownOnce(true)
    }
  }, [])

  // Fetch current user details from API
  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("You are not logged in. Please log in to view your profile.")
        setLoading(false)
        return
      }

      // Hardcoded API URL for local development
      const API_BASE_URL = "http://localhost:3000"

      const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Map the incoming data to the new UserDetails interface
      const userData = response.data.user
      const mappedUserDetails: UserDetails = {
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        gender: userData.gender,
        bio: userData.bio,
        profilePicture: userData.profilePicture,
        coverPhoto: userData.coverPhoto,
        location: userData.location ? { ...userData.location } : undefined,
        accountType: userData.accountType, // Map 'type' from API to 'accountType'
        isVerified: userData.isVerified, // Directly use the boolean from API for 'isVerified'
        status: userData.status,
        createdAt: userData.createdAt,
        idDocuments: userData.idDocuments,
        secretQuestion: userData.secretQuestion,
        secretAnswer: userData.secretAnswer,
        secretCode: userData.secretCode,
      }

      setUserDetails(mappedUserDetails)
      // Initialize editedDetails and originalEmail when userDetails are fetched
      if (mappedUserDetails) {
        setEditedDetails({
          firstName: mappedUserDetails.firstName,
          lastName: mappedUserDetails.lastName,
          middleName: mappedUserDetails.middleName,
          email: mappedUserDetails.email,
          mobileNumber: mappedUserDetails.mobileNumber,
          gender: mappedUserDetails.gender,
          bio: mappedUserDetails.bio,
          location: mappedUserDetails.location ? { ...mappedUserDetails.location } : undefined,
          idDocuments: mappedUserDetails.idDocuments,
          secretQuestion: mappedUserDetails.secretQuestion,
          secretAnswer: mappedUserDetails.secretAnswer,
          secretCode: mappedUserDetails.secretCode,
        })
        setSelectedLocation(mappedUserDetails.location ? { ...mappedUserDetails.location } : null)
        setOriginalEmail(mappedUserDetails.email)
        setFrontIdPreview(mappedUserDetails.idDocuments?.front || null)
        setBackIdPreview(mappedUserDetails.idDocuments?.back || null)
        setSecretQuestion(mappedUserDetails.secretQuestion || "")
        setSecretAnswer(mappedUserDetails.secretAnswer || "")
        setSecretCode(mappedUserDetails.secretCode || null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error("Error fetching user details:", err)
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to load user profile: ${err.response.data.message}`)
      } else {
        setError("Failed to load user profile. Please try again later.")
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const handleSaveInfo = () => {
    if (!selectedInfo) return

    const updatedInfo = personalInfo.map((info) => (info.id === selectedInfo.id ? { ...info, ...editedInfo } : info))

    setPersonalInfo(updatedInfo)
    setIsEditModalOpen(false)
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
    // Update secret question/answer states directly for secret code generation
    if (name === "secretQuestion") {
      setSecretQuestion(value)
    }
    if (name === "secretAnswer") {
      setSecretAnswer(value)
    }
  }

  const API_BASE_URL = "http://localhost:3000" // Defined here for use in new functions

  // NEW: Generic function to send email verification code
  const sendVerificationCode = useCallback(async (email: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token") // Assuming token is stored here
      if (!token) {
        setSaveDetailsError("Authentication token missing. Please log in again.")
        return false
      }
      const response = await axios.post(
        `${API_BASE_URL}/api/users/send-email-verification`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.status === 200
    } catch (error) {
      console.error("Error sending verification code:", error)
      setSaveDetailsError("Failed to send verification code. Please try again.")
      return false
    }
  }, [])

  // NEW: Modified handleOtpAndRecaptchaSuccess to handle the new email verification flow
  const handleEmailVerificationSuccess = useCallback(async (data: { user: UserDetails; token?: string }) => {
    setIsSavingDetails(true)
    setSaveDetailsError(null)
    setShowOtpModal(false) // Close OTP modal

    // The `data.user` here should already contain the updated email from the backend's verifyEmailVerificationCode
    // Re-map the incoming user data to the new UserDetails interface
    const userData = data.user
    const mappedUserDetails: UserDetails = {
      _id: userData._id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      email: userData.email,
      mobileNumber: userData.mobileNumber,
      gender: userData.gender,
      bio: userData.bio,
      profilePicture: userData.profilePicture,
      coverPhoto: userData.coverPhoto,
      location: userData.location ? { ...userData.location } : undefined,
      accountType: userData.accountType, // Map 'type' from API to 'accountType'
      isVerified: userData.isVerified, // Directly use the boolean from API for 'isVerified'
      status: userData.status,
      createdAt: userData.createdAt,
      idDocuments: userData.idDocuments,
      secretQuestion: userData.secretQuestion,
      secretAnswer: userData.secretAnswer,
      secretCode: userData.secretCode,
    }
    setUserDetails(mappedUserDetails) // Update main userDetails state
    setShowFinalSuccessModal(true) // Show final success modal
    setIsEditingDetails(false) // Exit editing mode

    // Automatically close success modal and main modal after a delay
    setTimeout(() => {
      setShowFinalSuccessModal(false)
    }, 2000) // Adjust delay as needed
    setIsSavingDetails(false)
    setPendingProfileUpdate(null) // Clear pending update
  }, [])

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

  // NEW: Helper function to upload a file to the API using axios
  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const token = localStorage.getItem("token") // Assuming token is needed for upload

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.url
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(`Failed to upload ${file.name}.`)
    }
  }

  // NEW: Handle file selection, preview, and immediate upload for ID documents
  const handleIdFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
    idSide: "front" | "back",
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Reset error states before new upload attempt
      setError("")
      setShowFileExistsModal(false)
      setShowGenericUploadErrorModal(false)

      // Create local DataURL preview immediately for quick feedback
      const reader = new FileReader()
      reader.onloadend = () => {
        previewSetter(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Attempt to upload the file immediately to the server
      try {
        const uploadedUrl = await uploadFile(file)
        previewSetter(uploadedUrl) // Update preview to the actual uploaded URL from the server
        setEditedDetails((prev) => ({
          ...prev,
          idDocuments: {
            ...prev?.idDocuments,
            [idSide]: uploadedUrl,
          },
        }))
        // Removed setShowObservationModal(true) from here
      } catch (error: any) {
        console.error("Upload error:", error)
        if (error.message.includes("File already exists")) {
          setShowFileExistsModal(true)
        } else {
          setGenericUploadErrorMessage(error.message || "An unknown error occurred during file upload.")
          setShowGenericUploadErrorModal(true)
        }
        previewSetter(null) // Clear the preview if upload fails
        setEditedDetails((prev) => ({
          ...prev,
          idDocuments: {
            ...prev?.idDocuments,
            [idSide]: null,
          },
        }))
        // Optionally, clear the file input value if the upload fails
        if (e.target) {
          e.target.value = ""
        }
      }
    } else {
      previewSetter(null) // Clear preview if no file is selected
      setEditedDetails((prev) => ({
        ...prev,
        idDocuments: {
          ...prev?.idDocuments,
          [idSide]: null,
        },
      }))
    }
  }

  // NEW: Function to trigger the warning modal or file input
  const handleIdUploadClick = (element: HTMLInputElement | null) => {
    if (!element) return // Ensure element exists

    if (!hasWarningBeenShownOnce) {
      setCurrentFileInputRef(element) // Store which element to trigger later
      setShowWarningModal(true)
      localStorage.setItem("v0_id_upload_warning_shown", "true")
      setHasWarningBeenShownOnce(true) // Update state immediately
    } else {
      element.click() // Directly trigger the file input
    }
  }

  const handleConfirmUpload = () => {
    if (currentFileInputRef) {
      currentFileInputRef.click() // Trigger the hidden file input
      setShowWarningModal(false)
      setCurrentFileInputRef(null) // Clear the ref
    }
  }

  const handleImageClick = (imageUrl: string | null) => {
    if (imageUrl) {
      setPopupImage(imageUrl)
      setIsImagePopupOpen(true)
    }
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    // Perform email validation on save attempt
    const isEmailValid = await handleEmailBlur()
    if (!isEmailValid) {
      setIsSavingDetails(false) // Stop saving if email is invalid
      setSaveDetailsError("Please fix the email error before saving.")
      return
    }

    // If email has changed and is valid/available, trigger the new verification flow
    if (editedDetails.email && editedDetails.email !== originalEmail) {
      setEmailToVerify(editedDetails.email)
      setPendingProfileUpdate(editedDetails) // Store all edited details for later
      const codeSent = await sendVerificationCode(editedDetails.email) // Use the new sendVerificationCode
      if (codeSent) {
        setShowOtpModal(true) // Show the OTP modal for verification
        setIsSavingDetails(false) // Stop saving animation, OTP modal will handle its own loading
        return // Prevent immediate profile update
      } else {
        // sendVerificationCode already sets saveError
        setIsSavingDetails(false)
        return
      }
    }

    // Determine if ID documents were updated
    const idDocumentsWereUpdated =
      frontIdPreview !== (userDetails?.idDocuments?.front || null) ||
      backIdPreview !== (userDetails?.idDocuments?.back || null)

    // If email has not changed, or if it's the same email, proceed with direct save of other fields
    setIsSavingDetails(true)
    setSaveDetailsError(null)
    const token = localStorage.getItem("token")

    if (!token) {
      setSaveDetailsError("Authentication token missing. Please log in.")
      setIsSavingDetails(false)
      return
    }

    try {
      const payload = {
        ...editedDetails,
        idDocuments: {
          front: frontIdPreview,
          back: backIdPreview,
        },
        secretQuestion: secretQuestion,
        secretAnswer: secretAnswer,
        secretCode: secretCode,
      }

      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // Re-map the incoming user data to the new UserDetails interface
      const userData = response.data.user
      const mappedUserDetails: UserDetails = {
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        gender: userData.gender,
        bio: userData.bio,
        profilePicture: userData.profilePicture,
        coverPhoto: userData.coverPhoto,
        location: userData.location ? { ...userData.location } : undefined,
        accountType: userData.accountType, // Map 'type' from API to 'accountType'
        isVerified: userData.isVerified, // Directly use the boolean from API for 'isVerified'
        status: userData.status,
        createdAt: userData.createdAt,
        idDocuments: userData.idDocuments,
        secretQuestion: userData.secretQuestion,
        secretAnswer: userData.secretAnswer,
        secretCode: userData.secretCode,
      }
      setUserDetails(mappedUserDetails) // Update main userDetails state
      setShowFinalSuccessModal(true) // Show success modal
      setIsEditingDetails(false) // Exit editing mode

      // Only show observation modal if ID documents were actually changed/uploaded
      if (idDocumentsWereUpdated) {
        setShowObservationModal(true)
      }

      setTimeout(() => {
        // Auto-close success modal
        setShowFinalSuccessModal(false)
      }, 2000)
    } catch (err: any) {
      console.error("Error saving user details:", err)
      if (err.response && err.response.data && err.response.data.message) {
        setSaveDetailsError(`Failed to save changes: ${err.response.data.message}`)
      } else {
        setSaveDetailsError("Failed to save changes. Please try again.")
      }
    } finally {
      setIsSavingDetails(false)
    }
  }

  const uploadImageAndSaveToProfile = async (file: File, imageType: "profilePicture" | "coverPhoto") => {
    const API_BASE_URL = "http://localhost:3000"
    const token = localStorage.getItem("token")

    if (!token) {
      setError("Authentication token missing. Please log in.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Step 1: Upload image to Vercel Blob
      const uploadResponse = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Ensure token is sent for upload if needed
        },
      })
      const imageUrl = uploadResponse.data.url

      // Step 2: Update user profile with the new image URL
      const updateResponse = await axios.put(
        `${API_BASE_URL}/api/user/update-image`,
        {
          imageType,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Re-map the incoming user data to the new UserDetails interface
      const userData = updateResponse.data.user
      const mappedUserDetails: UserDetails = {
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        gender: userData.gender,
        bio: userData.bio,
        profilePicture: userData.profilePicture,
        coverPhoto: userData.coverPhoto,
        location: userData.location ? { ...userData.location } : undefined,
        accountType: userData.accountType, // Map 'type' from API to 'accountType'
        isVerified: userData.isVerified, // Directly use the boolean from API for 'isVerified'
        status: userData.status,
        createdAt: userData.createdAt,
        idDocuments: userData.idDocuments,
        secretQuestion: userData.secretQuestion,
        secretAnswer: userData.secretAnswer,
        secretCode: userData.secretCode,
      }
      setUserDetails(mappedUserDetails)
      setError(null) // Clear any previous errors
    } catch (err: any) {
      console.error(`Error uploading or updating ${imageType}:`, err)
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to update ${imageType}: ${err.response.data.message}`)
      } else {
        setError(`Failed to update ${imageType}. Please try again.`)
      }
    }
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingProfilePicture(true)
      await uploadImageAndSaveToProfile(e.target.files[0], "profilePicture")
      setIsUploadingProfilePicture(false)
    }
  }

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingCoverPhoto(true)
      await uploadImageAndSaveToProfile(e.target.files[0], "coverPhoto")
      setIsUploadingCoverPhoto(false)
    }
  }

  const handleResetImages = async () => {
    setIsResettingImages(true)
    const API_BASE_URL = "http://localhost:3000"
    const token = localStorage.getItem("token")

    if (!token) {
      setError("Authentication token missing. Please log in.")
      setIsResettingImages(false)
      return
    }

    try {
      // Reset profile picture
      const profilePicResetResponse = await axios.put(
        `${API_BASE_URL}/api/user/update-image`,
        {
          imageType: "profilePicture",
          imageUrl: originalProfilePicture || null, // Use null if original was undefined/null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      // Re-map the incoming user data to the new UserDetails interface
      const profilePicUserData = profilePicResetResponse.data.user
      const mappedProfilePicUserDetails: UserDetails = {
        _id: profilePicUserData._id,
        firstName: profilePicUserData.firstName,
        lastName: profilePicUserData.lastName,
        middleName: profilePicUserData.middleName,
        email: profilePicUserData.email,
        mobileNumber: profilePicUserData.mobileNumber,
        gender: profilePicUserData.gender,
        bio: profilePicUserData.bio,
        profilePicture: profilePicUserData.profilePicture,
        coverPhoto: profilePicUserData.coverPhoto,
        location: profilePicUserData.location ? { ...profilePicUserData.location } : undefined,
        accountType: profilePicUserData.accountType, // Map 'type' from API to 'accountType'
        isVerified: profilePicUserData.isVerified, // Directly use the boolean from API for 'isVerified'
        status: profilePicUserData.status,
        createdAt: profilePicUserData.createdAt,
        idDocuments: profilePicUserData.idDocuments,
        secretQuestion: profilePicUserData.secretQuestion,
        secretAnswer: profilePicUserData.secretAnswer,
        secretCode: profilePicUserData.secretCode,
      }
      setUserDetails(mappedProfilePicUserDetails) // Update userDetails after first reset

      // Reset cover photo
      const coverPhotoResetResponse = await axios.put(
        `${API_BASE_URL}/api/user/update-image`,
        {
          imageType: "coverPhoto",
          imageUrl: originalCoverPhoto || null, // Use null if original was undefined/null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      // Re-map the incoming user data to the new UserDetails interface
      const coverPhotoUserData = coverPhotoResetResponse.data.user
      const mappedCoverPhotoUserDetails: UserDetails = {
        _id: coverPhotoUserData._id,
        firstName: coverPhotoUserData.firstName,
        lastName: coverPhotoUserData.lastName,
        middleName: coverPhotoUserData.middleName,
        email: coverPhotoUserData.email,
        mobileNumber: coverPhotoUserData.mobileNumber,
        gender: coverPhotoUserData.gender,
        bio: coverPhotoUserData.bio,
        profilePicture: coverPhotoUserData.profilePicture,
        coverPhoto: coverPhotoUserData.coverPhoto,
        location: coverPhotoUserData.location ? { ...coverPhotoUserData.location } : undefined,
        accountType: coverPhotoUserData.accountType, // Map 'type' from API to 'accountType'
        isVerified: coverPhotoUserData.isVerified, // Directly use the boolean from API for 'isVerified'
        status: coverPhotoUserData.status,
        createdAt: coverPhotoUserData.createdAt,
        idDocuments: coverPhotoUserData.idDocuments,
        secretQuestion: coverPhotoUserData.secretQuestion,
        secretAnswer: coverPhotoUserData.secretAnswer,
        secretCode: coverPhotoUserData.secretCode,
      }
      setUserDetails(mappedCoverPhotoUserDetails) // Update userDetails after second reset

      setIsEditingProfile(false) // Exit editing mode
      setError(null) // Clear any previous errors
    } catch (err: any) {
      console.error("Error resetting images:", err)
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to reset images: ${err.response.data.message}`)
      } else {
        setError("Failed to reset images. Please try again.")
      }
    } finally {
      setIsResettingImages(false)
    }
  }

  // Determine border color class for email input
  const emailBorderClass =
    emailValidationStatus === "available"
      ? "border-green-500 focus:ring-green-500"
      : emailValidationStatus === "unavailable"
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-sky-500"

  const renderTabContent = () => {
    if (activeTab === "personal") {
      return (
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-3xl p-6">
            <h3 className="text-xl font-medium text-gray-700 mb-6">Basic Information</h3>
            {saveDetailsError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {saveDetailsError}</span>
              </div>
            )}
            {isEditingDetails ? (
              <form onSubmit={handleSaveDetails} className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={editedDetails.firstName || ""}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                  {/* Middle Name */}
                  <div>
                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="middleName"
                        name="middleName"
                        value={editedDetails.middleName || ""}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={editedDetails.lastName || ""}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={editedDetails.mobileNumber || ""}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <div className="relative">
                      <Venus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <select
                        id="gender"
                        name="gender"
                        value={editedDetails.gender || ""}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-full">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <div className="relative">
                    <Text className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      id="bio"
                      name="bio"
                      value={editedDetails.bio || ""}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div>
                    <h4 className="text-lg font-medium mb-2 text-gray-700">Location</h4>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="w-full rounded-md bg-sky-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-sky-600"
                    >
                      Open Location Selector
                    </button>
                    <div className="mt-2 rounded-lg bg-gray-50 p-4">
                      {!selectedLocation && (
                        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
                          <p className="text-gray-400">No location selected</p>
                        </div>
                      )}
                    </div>
                    {selectedLocation && (
                      <div className="mt-2 rounded-lg border bg-white p-4 shadow-sm">
                        <h4 className="mb-2 font-medium">Selected Location</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500">Location Name</label>
                            <p className="font-medium text-gray-800">{selectedLocation.name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-500">Distance</label>
                              <p className="font-medium text-gray-800">{selectedLocation.distance.toFixed(1)} km</p>
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

                  {/* Secret Question & Answer */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Secret Question & Answer</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="secretQuestion" className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Question
                        </label>
                        <div className="relative">
                          <Text className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            id="secretQuestion"
                            name="secretQuestion"
                            value={secretQuestion}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="e.g., What is your mother's maiden name?"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="secretAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Answer
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showSecretAnswerInput ? "text" : "password"}
                            id="secretAnswer"
                            name="secretAnswer"
                            value={secretAnswer}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your secret answer"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecretAnswerInput((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showSecretAnswerInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showSecretAnswerInput ? "Hide answer" : "Show answer"}</span>
                          </button>
                        </div>
                      </div>
                      {secretCode && (
                        <div className="mt-6 p-4 bg-sky-50 border border-sky-100 rounded-lg text-center">
                          <h5 className="text-sm font-medium text-sky-800 mb-2">Your Secret Code:</h5>
                          <p className="text-2xl font-bold text-sky-600 tracking-wider select-all">{secretCode}</p>
                          <p className="mt-2 text-xs text-sky-700">
                            Note: This code is generated from your question and answer. Keep it safe.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grouped ID Documents Upload and Secret Question & Answer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-full">
                  {/* Email */}
                  <div>
                    <h4 className="text-lg font-medium mb-2 text-gray-700">Email Address</h4>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={editedDetails.email || ""}
                          onChange={handleInputChange}
                          onBlur={handleEmailBlur} // NEW: Add onBlur handler
                          className={`w-full rounded-md border py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 ${emailBorderClass}`} // NEW: Dynamic border class
                          required
                          disabled={isCheckingEmail || isSavingDetails} // NEW: Disable input during check/save
                        />
                      </div>
                      {isCheckingEmail && ( // NEW: Loading indicator for email check
                        <p className="mt-1 flex items-center text-sm text-gray-500">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking availability...
                        </p>
                      )}
                      {emailValidationStatus === "available" &&
                        !isCheckingEmail && ( // NEW: Success message
                          <p className="mt-1 flex items-center text-sm text-green-500">
                            <Check className="mr-2 h-4 w-4" /> Email is available!
                          </p>
                        )}
                      {emailValidationStatus === "unavailable" &&
                        emailError && ( // NEW: Error message
                          <p className="mt-1 flex items-center text-sm text-red-500">
                            <X className="mr-2 h-4 w-4" /> {emailError}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* ID Documents Upload */}
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">ID Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Front ID */}
                    <div>
                      <label htmlFor="front-id" className="mb-2 block text-sm font-medium">
                        Front of ID (optional)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${frontIdPreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
                        onClick={() => handleIdUploadClick(frontIdRef.current)}
                      >
                        {frontIdPreview ? (
                          <div
                            className="relative w-full h-40 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageClick(frontIdPreview)
                            }}
                          >
                            <img
                              src={frontIdPreview || "/placeholder.svg"}
                              alt="ID Document Front Preview"
                              className="object-contain w-full h-full filter blur-sm hover:blur-[2px] transition-all"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                Click to view
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Upload front of your valid ID</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF up to 5MB</p>
                          </>
                        )}
                        <input
                          id="front-id"
                          type="file"
                          ref={frontIdRef}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleIdFileChange(e, setFrontIdPreview, "front")}
                        />
                      </div>
                    </div>

                    {/* Back ID */}
                    <div>
                      <label htmlFor="back-id" className="mb-2 block text-sm font-medium">
                        Back of ID (optional)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${backIdPreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
                        onClick={() => handleIdUploadClick(backIdRef.current)}
                      >
                        {backIdPreview ? (
                          <div
                            className="relative w-full h-40 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageClick(backIdPreview)
                            }}
                          >
                            <img
                              src={backIdPreview || "/placeholder.svg"}
                              alt="ID Document Back Preview"
                              className="object-contain w-full h-full filter blur-sm hover:blur-[2px] transition-all"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                Click to view
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Upload back of your valid ID</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF up to 5MB</p>
                          </>
                        )}
                        <input
                          id="back-id"
                          type="file"
                          ref={backIdRef}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleIdFileChange(e, setBackIdPreview, "back")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-full flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingDetails(false)
                      // Reset editedDetails to current userDetails on cancel
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
                          idDocuments: userDetails.idDocuments,
                          secretQuestion: userDetails.secretQuestion,
                          secretAnswer: userDetails.secretAnswer,
                          secretCode: userDetails.secretCode,
                        })
                        setSelectedLocation(userDetails.location ? { ...userDetails.location } : null)
                        setOriginalEmail(userDetails.email)
                        setFrontIdPreview(userDetails.idDocuments?.front || null)
                        setBackIdPreview(userDetails.idDocuments?.back || null)
                        setSecretQuestion(userDetails.secretQuestion || "")
                        setSecretAnswer(userDetails.secretAnswer || "")
                        setSecretCode(userDetails.secretCode || null)
                      }
                      setSaveDetailsError(null)
                      setEmailError(null)
                      setEmailValidationStatus("idle")
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-white shadow-sm transition-all hover:bg-sky-600"
                    disabled={isSavingDetails || isCheckingEmail || emailValidationStatus === "unavailable"}
                  >
                    {isSavingDetails ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <User className="mr-2 h-4 w-4" /> Full Name
                  </h4>
                  <p className="text-gray-900">
                    {userDetails
                      ? `${userDetails.firstName} ${userDetails.middleName || ""} ${userDetails.lastName}`
                      : "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </h4>
                  <p className="text-gray-900">{userDetails?.email || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <Phone className="mr-2 h-4 w-4" /> Phone Number
                  </h4>
                  <p className="text-gray-900">{userDetails?.mobileNumber || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <MapPin className="mr-2 h-4 w-4" /> Location
                  </h4>
                  <p className="text-gray-900">{userDetails?.location?.name || "Not specified"}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" /> Account Created
                  </h4>
                  <p className="text-gray-900">
                    {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <Venus className="mr-2 h-4 w-4" /> Gender
                  </h4>
                  <p className="text-gray-900">{userDetails?.gender || "Not specified"}</p>
                </div>
                <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <Text className="mr-2 h-4 w-4" /> Bio
                  </h4>
                  <p className="text-gray-900">{userDetails?.bio || "No bio provided"}</p>
                </div>
                {/* ID Documents */}
                <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <ImageIcon className="mr-2 h-4 w-4" /> ID Documents
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-gray-700 text-sm mb-1">Front Side:</p>
                      {userDetails?.idDocuments?.front ? (
                        <div
                          className="relative w-full h-32 cursor-pointer"
                          onClick={() => handleImageClick(userDetails.idDocuments?.front || null)}
                        >
                          <img
                            src={userDetails.idDocuments.front || "/placeholder.svg"}
                            alt="ID Document Front"
                            className="w-full h-32 object-cover rounded-md border border-gray-300 filter blur-sm hover:blur-[2px] transition-all"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">Click to view</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded-md text-gray-500 text-sm">
                          No front ID provided
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm mb-1">Back Side:</p>
                      {userDetails?.idDocuments?.back ? (
                        <div
                          className="relative w-full h-32 cursor-pointer"
                          onClick={() => handleImageClick(userDetails.idDocuments?.back || null)}
                        >
                          <img
                            src={userDetails.idDocuments.back || "/placeholder.svg"}
                            alt="ID Document Back"
                            className="w-full h-32 object-cover rounded-md border border-gray-300 filter blur-sm hover:blur-[2px] transition-all"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">Click to view</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded-md text-gray-500 text-sm">
                          No back ID provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secret Question */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <Text className="mr-2 h-4 w-4" /> Secret Question
                  </h4>
                  <p className="text-gray-900">
                    {userDetails?.secretQuestion && userDetails.secretQuestion !== "not provided"
                      ? userDetails.secretQuestion
                      : "Not set"}
                  </p>
                </div>

                {/* Secret Answer Status (not the answer itself) */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 flex items-center text-sm font-medium text-gray-500">
                    <Lock className="mr-2 h-4 w-4" /> Secret Answer
                  </h4>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">
                      {userDetails?.secretAnswer && userDetails.secretAnswer !== "not provided"
                        ? showSecretAnswerView
                          ? userDetails.secretAnswer
                          : "••••••••"
                        : "Not set"}
                    </p>
                    {userDetails?.secretAnswer && userDetails.secretAnswer !== "not provided" && (
                      <button
                        type="button"
                        onClick={() => setShowSecretAnswerView((prev) => !prev)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showSecretAnswerView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showSecretAnswerView ? "Hide answer" : "Show answer"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (activeTab === "security") {
      return (
        <div className="bg-white rounded-3xl p-6">
          <h3 className="text-xl font-medium text-gray-700 mb-6">Change Password</h3>
          <form className="space-y-4 max-w-md">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Confirm your new password"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )
    }

    if (activeTab === "delete") {
      return (
        <div className="bg-white rounded-3xl p-6">
          <h3 className="text-xl font-medium mb-2 text-red-600">Delete Account</h3>
          <p className="text-gray-600 mb-6">Once you delete your account, there is no going back. Please be certain.</p>

          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <h4 className="font-medium text-red-800 mb-2">Before you proceed, please understand:</h4>
              <ul className="list-disc pl-5 space-y-2 text-red-700 text-sm">
                <li>All your personal information will be permanently deleted</li>
                <li>Your service listings will be removed from the platform</li>
                <li>Your booking history will be anonymized</li>
                <li>You will lose access to any pending payments</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium mb-3">Deletion Process:</h4>
              <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                <li>
                  <p className="font-medium">Request Account Deletion</p>
                  <p className="text-sm text-gray-600">
                    Submit your request by clicking the "Delete Account" button below.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Verification</p>
                  <p className="text-sm text-gray-600">
                    We'll send a verification code to your email address to confirm your identity.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Confirmation</p>
                  <p className="text-sm text-gray-600">
                    Enter the verification code and confirm your decision to delete your account.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Account Deletion</p>
                  <p className="text-sm text-gray-600">
                    Your account will be scheduled for deletion. This process may take up to 30 days to complete.
                  </p>
                </li>
              </ol>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-700 mb-4">
                To proceed with account deletion, please type <span className="font-medium">"DELETE MY ACCOUNT"</span>{" "}
                in the field below:
              </p>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type DELETE MY ACCOUNT"
                />
              </div>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === "booking") {
      return (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6">Booking Settings</h3>
          <p className="text-gray-600 mb-6">Configure system-wide booking timers and commission settings.</p>

          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Important Information:</h4>
              <ul className="list-disc pl-5 space-y-2 text-blue-700 text-sm">
                <li>Changes to these settings will affect all future bookings</li>
                <li>Timer values are in minutes</li>
                <li>Commission settings affect platform revenue</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Commission Timer Settings */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-timer"
                    >
                      <path d="M10 2h4" />
                      <path d="M12 14v-4" />
                      <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6" />
                      <path d="M9 17H4v5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Commission Timer</h4>
                    <p className="text-sm text-gray-500">Time before commission is automatically processed</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="commission-timer" className="block text-sm font-medium text-gray-700 mb-1">
                      Timer Duration (minutes)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="commission-timer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        defaultValue={1}
                        min={1}
                        max={1440}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Default: 1 minute. Recommended range: 1-5 minutes.</p>
                  </div>

                  <div className="pt-2">
                    <label htmlFor="commission-rate" className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Rate (%)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="commission-rate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        defaultValue={0.5}
                        min={1}
                        max={20}
                        step={0.5}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Default: 0.5%. This is the percentage taken from each transaction.
                    </p>
                  </div>
                </div>
              </div>

              {/* Auto-Cancellation Timer Settings */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-alarm-clock-off"
                    >
                      <path d="M6.87 6.87A8 8 0 1 0 21 12" />
                      <path d="M19.71 19.71a8 8 0 0 1-11.31-11.31" />
                      <path d="M22 6 L6 22" />
                      <path d="M10 4H4v6" />
                      <path d="M12 9v1" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Auto-Cancellation Timer</h4>
                    <p className="text-sm text-gray-500">Time before unpaid bookings are automatically cancelled</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="cancellation-timer" className="block text-sm font-medium text-gray-700 mb-1">
                      Timer Duration (minutes)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="cancellation-timer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        defaultValue={720}
                        min={5}
                        max={1440}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Default: 720 minutes (12 hours). Recommended range: 4,320 minutes (3 days).
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="enable-notifications" className="text-sm font-medium text-gray-700">
                        Send Reminder Notifications
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="enable-notifications" defaultChecked className="sr-only" />
                        <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                        <style>{`
                    input:checked ~ .dot {
                      transform: translateX(100%);
                    }
                    input:checked ~ .block {
                      background-color: #3b82f6;
                    }
                  `}</style>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Send notifications to customers before auto-cancellation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        {/* Skeleton for Cover Photo */}
        <div className="relative h-80 overflow-hidden rounded-b-3xl bg-gray-200"></div>

        {/* Skeleton for Profile Info with Stats */}
        <div className="relative px-4 pb-8">
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-300"></div>
          </div>

          <div className="pt-20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full max-w-2xl mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 max-w-2xl"></div>
          </div>
        </div>

        {/* Skeleton for Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex -mb-px overflow-x-auto">
              <div className="py-4 px-6 h-12 bg-gray-200 rounded w-28 mr-4"></div>
              <div className="py-4 px-6 h-12 bg-gray-200 rounded w-28 mr-4"></div>
              <div className="py-4 px-6 h-12 bg-gray-200 rounded w-28"></div>
            </nav>
          </div>
        </div>

        {/* Skeleton for Content Section */}
        <div className="px-4 py-8 mb-20">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-300 rounded w-64"></div>
            <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="mt-6">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include animation keyframes */}
      <style>{keyframes}</style>

      {/* User Profile Section */}
      <div className="z-40 flex">
        <MyFloatingDockCustomer />
      </div>

      <div className="max-w-7xl mx-auto font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        {/* Cover Photo */}
        <div className="relative h-80 overflow-hidden rounded-b-3xl">
          <img
            src={userDetails?.coverPhoto || "/placeholder.svg?height=320&width=1280"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isEditingProfile && (
            <label
              htmlFor="cover-photo-upload"
              className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all cursor-pointer"
            >
              {isUploadingCoverPhoto ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              <input
                id="cover-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoChange}
                disabled={isUploadingCoverPhoto}
              />
            </label>
          )}
        </div>

        {/* Profile Info with Stats */}
        <div className="relative px-4 pb-8">
          <div className="absolute -top-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img
                  src={userDetails?.profilePicture || "/placeholder.svg?height=128&width=128"}
                  alt={userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : "Provider"}
                  className="w-full h-full object-cover"
                />
                {userDetails?.isVerified && (
                  <div className="absolute -bottom-[-5px] -right-[-8px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-white shadow-md">
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </div>
                )}
              </div>
              {isEditingProfile && (
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 cursor-pointer"
                >
                  {isUploadingProfilePicture ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  ) : (
                    <Camera className="h-4 w-4 text-gray-600" />
                  )}
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                    disabled={isUploadingProfilePicture}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-20">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-medium text-gray-700">
                  {userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : "Provider"}
                </h1>

                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {userDetails?.accountType === "customer"
                    ? "Customer"
                    : userDetails?.accountType === "provider"
                      ? "Provider"
                      : userDetails?.accountType || "invalid"}
                </span>

                {userDetails?.isVerified !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${userDetails.isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {userDetails.isVerified ? "Verified" : "Unverified"}
                  </span>
                )}

              </div>
              <div>
                <button
                  onClick={() => {
                    if (!isEditingProfile) {
                      setOriginalProfilePicture(userDetails?.profilePicture)
                      setOriginalCoverPhoto(userDetails?.coverPhoto)
                    }
                    setIsEditingProfile((prev) => !prev)
                  }}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-white transition-all hover:bg-sky-600"
                >
                  {isEditingProfile ? "Done Editing" : "Change Profile"}
                </button>
              </div>

            </div>

            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{userDetails?.location?.name || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2 mt-8 text-gray-600">
              <span>{userDetails?.bio}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditingProfile && (
              <button
                onClick={handleResetImages}
                disabled={isResettingImages}
                className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-all hover:bg-gray-50"
              >
                {isResettingImages ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset"}
              </button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium ${activeTab === "personal"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-user"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />

                  <circle cx="12" cy="7" r="4" />
                </svg>
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium ${activeTab === "security"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lock"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Security
              </button>
              <button
                onClick={() => setActiveTab("delete")}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium ${activeTab === "delete"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash-2"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
                Delete Account
              </button>
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 py-8 mb-20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-medium text-gray-700">
              {activeTab === "personal"
                ? "Personal Information"
                : activeTab === "security"
                  ? "Security Settings"
                  : activeTab === "earnings"
                    ? "Commission Earnings"
                    : activeTab === "booking"
                      ? "Booking Settings"
                      : "Delete Account"}
            </h2>
            {activeTab === "personal" && (
              <button
                onClick={() => {
                  setIsEditingDetails((prev) => !prev)
                  // Reset editedDetails to current userDetails when starting edit
                  if (!isEditingDetails && userDetails) {
                    setEditedDetails({
                      firstName: userDetails.firstName,
                      lastName: userDetails.lastName,
                      middleName: userDetails.middleName,
                      email: userDetails.email,
                      mobileNumber: userDetails.mobileNumber,
                      gender: userDetails.gender,
                      bio: userDetails.bio,
                      location: userDetails.location ? { ...userDetails.location } : undefined,
                      idDocuments: userDetails.idDocuments,
                      secretQuestion: userDetails.secretQuestion,
                      secretAnswer: userDetails.secretAnswer,
                      secretCode: userDetails.secretCode,
                    })
                    setSelectedLocation(userDetails.location ? { ...userDetails.location } : null)
                    setOriginalEmail(userDetails.email)
                    setFrontIdPreview(userDetails.idDocuments?.front || null)
                    setBackIdPreview(userDetails.idDocuments?.back || null)
                    setSecretQuestion(userDetails.secretQuestion || "")
                    setSecretAnswer(userDetails.secretAnswer || "")
                    setSecretCode(userDetails.secretCode || null)
                  }
                  setSaveDetailsError(null)
                  setEmailError(null)
                  setEmailValidationStatus("idle")
                }}
                className="rounded-lg bg-sky-500 px-4 py-2 text-white transition-all hover:bg-sky-600"
              >
                {isEditingDetails ? "Cancel Editing" : "Edit Details"}
              </button>
            )}
          </div>

          {renderTabContent()}
        </div>
      </div>

      {/* Edit Info Modal (existing) */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex flex-col md:flex-row">
              {/* Preview Section */}
              <div className="flex flex-col bg-gray-50 p-6 md:w-2/5">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Preview</h3>

                <div className="flex flex-col">
                  <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-200">
                    <img
                      src={editedInfo.image || "/placeholder.svg?height=192&width=384"}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=192&width=384"
                      }}
                    />
                  </div>

                  <div className="flex-1 rounded-xl bg-white p-4 shadow-sm">
                    <h4 className="mb-2 text-xl font-semibold">{editedInfo.title || "Title"}</h4>
                    {editedInfo.organization && (
                      <p className="mb-1 text-sm text-gray-700">
                        {editedInfo.organization} {editedInfo.location && `• ${editedInfo.location}`}
                      </p>
                    )}
                    {editedInfo.startDate && (
                      <p className="mb-3 text-sm text-gray-600">
                        {new Date(editedInfo.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}{" "}
                        -
                        {editedInfo.endDate === "Present"
                          ? " Present"
                          : editedInfo.endDate
                            ? ` ${new Date(editedInfo.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`
                            : ""}
                      </p>
                    )}
                    <p className="line-clamp-4 text-sm text-gray-600">
                      {editedInfo.description || "Description will appear here."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="border-t border-gray-200 p-6 md:w-3/5 md:border-l md:border-t-0">
                <div className="mb-6 flex items-start justify-between">
                  <Dialog.Title className="text-xl font-semibold">
                    Edit{" "}
                    {selectedInfo?.type
                      ? selectedInfo.type.charAt(0).toUpperCase() + selectedInfo.type.slice(1)
                      : "Info"}
                  </Dialog.Title>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedInfo && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSaveInfo()
                    }}
                    className="pr-2 space-y-4 overflow-y-auto max-h-[60vh]"
                  >
                    <div>
                      <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={editedInfo.title || ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                    </div>

                    {(selectedInfo.type === "education" || selectedInfo.type === "experience") && (
                      <>
                        <div>
                          <label htmlFor="organization" className="mb-1 block text-sm font-medium text-gray-700">
                            {selectedInfo.type === "education" ? "Institution" : "Company"}
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              id="organization"
                              name="organization"
                              value={editedInfo.organization || ""}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              id="location"
                              name="location"
                              value={editedInfo.location || ""}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <div className="relative">
                              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={editedInfo.startDate || ""}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <div className="relative">
                              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={editedInfo.endDate === "Present" ? "" : editedInfo.endDate || ""}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                            <div className="mt-1 flex items-center">
                              <input
                                type="checkbox"
                                id="currentlyHere"
                                checked={editedInfo.endDate === "Present"}
                                onChange={(e) => {
                                  setEditedInfo({
                                    ...editedInfo,
                                    endDate: e.target.checked ? "Present" : "",
                                  })
                                }}
                                className="mr-2"
                              />
                              <label htmlFor="currentlyHere" className="text-sm text-gray-600">
                                Currently {selectedInfo.type === "education" ? "studying here" : "working here"}
                              </label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="image" className="mb-1 block text-sm font-medium text-gray-700">
                        Image URL
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          id="image"
                          name="image"
                          value={editedInfo.image || ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Enter image URL or leave blank for default"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Enter a valid image URL to see the preview update in real-time
                      </p>
                    </div>

                    <div>
                      <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="relative">
                        <Text className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          id="description"
                          name="description"
                          value={editedInfo.description || ""}
                          onChange={handleInputChange}
                          className="min-h-[120px] w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 text-white transition-colors hover:bg-sky-600"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Location selection modal (moved from EditProfileDetailsModal) */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowLocationModal(false)}></div>
          <div className="relative z-10 h-[80vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4">
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

      {/* OTP Verification Modal (moved from EditProfileDetailsModal) */}
      <OTP
        visible={showOtpModal}
        email={emailToVerify}
        onClose={() => {
          setShowOtpModal(false)
          setSaveDetailsError("Email verification cancelled.") // Optionally set an error if user closes OTP modal
          setIsSavingDetails(false) // Ensure saving state is reset
        }}
        onOtpVerifiedSuccess={handleEmailVerificationSuccess} // NEW: Use the new success handler
        onResendOtp={sendVerificationCode} // NEW: Use the new send function
      />

      {/* Final Success Modal (moved from EditProfileDetailsModal) */}
      <ProfileUpdateSuccessModal isOpen={showFinalSuccessModal} onClose={() => setShowFinalSuccessModal(false)} />

      {/* Warning Modal for ID Upload */}
      {showWarningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20"
            style={{ animation: "slideInUp 0.4s ease-out" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-700">Confidential Information</h3>
              </div>
              <button
                onClick={() => {
                  setShowWarningModal(false)
                  if (currentFileInputRef) {
                    currentFileInputRef.value = "" // Clear the file input value
                  }
                  setCurrentFileInputRef(null) // Clear the ref
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                The document you are about to upload contains sensitive personal information. We want to assure you
                that:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Your documents are stored securely with enterprise-grade encryption</li>
                <li>Access is strictly limited to verification personnel only</li>
                <li>Documents will only be used for identity verification purposes</li>
                <li>We comply with all data protection regulations</li>
              </ul>
              <p className="mt-4 text-gray-600">
                We value your trust and are committed to protecting your confidential information.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWarningModal(false)
                  if (currentFileInputRef) {
                    currentFileInputRef.value = "" // Clear the file input value
                  }
                  setCurrentFileInputRef(null) // Clear the ref
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
              >
                Proceed with Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Already Exists Modal */}
      {showFileExistsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20"
            style={{ animation: "slideInUp 0.4s ease-out" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-700">File Already Exists</h3>
              </div>
              <button onClick={() => setShowFileExistsModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                A file with the same name has already been uploaded. Please upload a different file or rename the file
                you are trying to upload.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowFileExistsModal(false)}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Upload Error Modal */}
      {showGenericUploadErrorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20"
            style={{ animation: "slideInUp 0.4s ease-out" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-700">Upload Failed</h3>
              </div>
              <button
                onClick={() => setShowGenericUploadErrorModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                {genericUploadErrorMessage || "There was an issue uploading your file. Please try again."}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowGenericUploadErrorModal(false)}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Under Observation Modal */}
      <AccountObservationModal isOpen={showObservationModal} onClose={() => setShowObservationModal(false)} />

      <ImagePopup imageUrl={popupImage} isOpen={isImagePopupOpen} onClose={() => setIsImagePopupOpen(false)} />
    </div>
  )
}

export default MyProfile