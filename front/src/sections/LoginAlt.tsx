"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, AlertTriangle, XCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import CustomerRequirements from "./Styles/CustomerRequirements"
import COORequirements from "./Styles/COORequirements"
import OTP from "../sections/Styles/OTP"
import TermsCondition from "../sections/Styles/TermsCondition"
import Cookies from "js-cookie"
import ForgotPassword from "../sections/Styles/ForgotPassword"
import logo1 from "@/assets/undraw_my-current-location_tudq.png"
import ReCAPTCHA from "./Styles/Recaptcha"
import { verifyRecaptchaClient } from "../../../server/Recaptcha/Recaptcha"

const keyframes = `
@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes bounceIn {
0% { transform: scale(0); opacity: 0; }
60% { transform: scale(1.2); }
100% { transform: 1; opacity: 1; }
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

import img1 from "../assets/Home/dec1.jpg"
import img2 from "../assets/Login/20210423103706.jpg"
import img3 from "../assets/Login/6.jpg"

const slideshowImages = [
  {
    src: img1,
  },
  {
    src: img2,
  },
  {
    src: img3,
  },
]

const documentCategories = [
  {
    id: "business-registration",
    title: "Business Registration & Legal Compliance",
    documents: [
      "DTI (Department of Trade and Industry) – For sole proprietors",
      "SEC (Securities and Exchange Commission) – For partnerships and corporations",
      "Barangay Business Clearance",
      "Mayor's Permit / Business Permit",
      "BIR Registration (Form 2303) – For tax compliance",
    ],
  },
  {
    id: "legal-agreements",
    title: "Legal Agreements & Policies",
    documents: [
      "Service Agreement Contracts – Defines terms of service with customers",
      "Terms and Conditions – Customer rights and obligations",
      "Privacy Policy – Compliance with Data Privacy Act (DPA)",
    ],
  },
  {
    id: "insurance",
    title: "Insurance & Liability Coverage",
    documents: [
      "General Liability Insurance – To cover damages during service",
      "Workers' Compensation Insurance – If you hire employees",
      "Property Damage Insurance – If your service involves customer properties",
    ],
  },
  {
    id: "operational",
    title: "Operational & Workforce Compliance",
    documents: [],
  },
  {
    id: "employee-documents",
    title: "Employee/Contractor Documents",
    documents: [
      "Employment Contracts (For in-house workers)",
      "Independent Contractor Agreements (For freelance service providers)",
      "Background Check & Police Clearance – Required for service workers",
      "Skills Certification – If services involve technical skills",
    ],
  },
  {
    id: "service-guidelines",
    title: "Standard Operating Procedures (SOPs) – Service quality and safety standards",
    documents: [
      "Code of Conduct – Professional behavior guidelines for employees",
      "Complaint & Dispute Resolution Policy – Handling customer issues",
    ],
  },
  {
    id: "health-safety",
    title: "Health & Safety Compliance",
    documents: [
      "Health Certificates (for personal services like massage, cleaning, etc.)",
      "COVID-19 or Other Health Protocols Compliance (if applicable)",
    ],
  },
  {
    id: "financial",
    title: "Financial & Tax Compliance",
    documents: [
      "Bank Account & Financial Records – Business account for transactions",
      "Official Receipts (OR) and Invoices – For customer payments (BIR-registered)",
      "Tax Compliance Documents",
      "Quarterly and annual tax returns",
      "BIR Form 2551Q (Percentage Tax) or VAT Registration (Form 2550M/2550Q)",
      "Pricing & Service Fee Structure – Transparent pricing for customers",
    ],
  },
  {
    id: "digital",
    title: "Digital & Online Platform Compliance",
    documents: [
      "Website / App Terms of Use – Legal protection for online services",
      "User Privacy Policy – Compliance with GDPR / DPA",
      "E-Payment Compliance – If accepting online payments",
      "Cybersecurity Policy – Protect customer and transaction data",
    ],
  },
]

export default function LoginAlt() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [saveCredentials, setSaveCredentials] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [accountType, setAccountType] = useState<string | null>(null)
  const [registrationStep, setRegistrationStep] = useState<"type" | "requirements">("type")
  const [showPendingWarning, setShowPendingWarning] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showUnsuccessModal, setShowUnsuccessModal] = useState(false)
  const [unsuccessMessage, setUnsuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(() => Cookies.get("terms_accepted") === "true")
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const [, setValidId] = useState<File | null>(null)
  const [, setSalaryCertificate] = useState<File | null>(null)
  const [, setUploadedDocuments] = useState<{ [key: string]: File[] }>({})
  const [, setActiveCategoryIndex] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [showFillAllPrompt, setShowFillAllPrompt] = useState(false)
  const [showUnverifiedWarning, setShowUnverifiedWarning] = useState(false)
  const [customerMinimalMode, setCustomerMinimalMode] = useState(false)

  const [countdown, setCountdown] = useState(0)
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [isRecaptchaVerifying, setIsRecaptchaVerifying] = useState(false)
  const [verifiedResponseData, setVerifiedResponseData] = useState<any | null>(null)
  const recaptchaRef = useRef<any>(null)

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email) {
      setError("Please enter your email.")
      setLoading(false)
      return
    }

    try {
      if (showPasswordField) {
        // Login with password
        if (!password) {
          setError("Please enter your password.")
          setLoading(false)
          return
        }

        const response = await fetch("http://localhost:3000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        console.log("Server response data (password login):", data)

        if (response.ok) {
          const user = data.user

          if (user.status === "pending") {
            setUnsuccessMessage("Your account is still pending approval. Please wait for confirmation from our team.")
            setShowUnsuccessModal(true)
            setTimeout(() => setShowUnsuccessModal(false), 4000)
            setLoading(false)
            return
          }

          if (user.status === "declined") {
            setUnsuccessMessage(
              `Your account has been declined.\nReason: ${user.declinedReason || "No reason provided."}`,
            )
            setShowUnsuccessModal(true)
            setTimeout(() => setShowUnsuccessModal(false), 5000)
            setLoading(false)
            return
          }

          if (user.status === "suspended") {
            const { suspensionDuration, suspensionReason } = user

            setUnsuccessMessage(
              `Your account is suspended.\n\nDuration: ${suspensionDuration || "N/A"} days\nReason: ${suspensionReason || "N/A"}`,
            )

            setShowUnsuccessModal(true)
            setTimeout(() => setShowUnsuccessModal(false), 6000)
            setLoading(false)
            return
          }

          setVerifiedResponseData({ user, token: data.token })
          setShowRecaptcha(true)
          setLoading(false)
          return
        } else {
          setUnsuccessMessage(data.message || "Login failed. Please check your credentials.")
          setShowUnsuccessModal(true)
          setTimeout(() => setShowUnsuccessModal(false), 2000)
        }
      } else {
        // Magic link: Send OTP
        const response = await fetch("http://localhost:3000/api/users/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        const data = await response.json()
        console.log("Server response data (send OTP):", data)

        if (response.ok) {
          setSuccessMessage(data.message)
          setShowSuccessModal(true)
          setTimeout(() => {
            setShowSuccessModal(false)
            setShowOtpModal(true)
          }, 1500)
        } else {
          if (response.status === 404) {
            setUnsuccessMessage(data.message || "Email not registered. Please create an account first.")
          } else {
            setUnsuccessMessage(data.message || "Failed to send magic link. Please try again.")
          }
          setShowUnsuccessModal(true)
          setTimeout(() => setShowUnsuccessModal(false), 2000)
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setUnsuccessMessage("Failed to connect to the server. Please try again later.")
      setShowUnsuccessModal(true)
      setTimeout(() => setShowUnsuccessModal(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleRecaptchaSuccess = useCallback(
    async (token: string) => {
      setIsRecaptchaVerifying(true)
      setError("")
      try {
        const result = await verifyRecaptchaClient(token)

        if (result.success) {
          setSuccessMessage(
            "Please take a moment to review our policies, terms of service, and important safety guidelines to prevent any unnecessary incidents and ensure a smooth experience.",
          )
          setShowSuccessModal(true)
          setIsCountdownActive(true)
          setCountdown(20)

          if (verifiedResponseData) {
            localStorage.setItem("user", JSON.stringify(verifiedResponseData.user))
            if (verifiedResponseData.token) {
              localStorage.setItem("token", verifiedResponseData.token)
              console.log("Token saved to localStorage:", verifiedResponseData.token)
            }
          }

          const userAccountType = verifiedResponseData?.user?.accountType
          let redirectPath = "/"
          switch (userAccountType) {
            case "customer":
              redirectPath = "/"
              break
            case "coo":
              redirectPath = "/coo"
              break
            case "admin":
              redirectPath = "/admin"
              break
            case "provider":
              redirectPath = "/provider"
              break
            default:
              redirectPath = "/"
          }

          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                setIsCountdownActive(false)
                setShowSuccessModal(false)
                setShowRecaptcha(false)
                window.location.href = redirectPath
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          setError(result.message || "reCAPTCHA verification failed.")
          recaptchaRef.current?.reset()
        }
      } catch (err: any) {
        console.error("Error during reCAPTCHA verification:", err)
        setError(`Network error during reCAPTCHA verification: ${err.message}`)
        recaptchaRef.current?.reset()
      } finally {
        setIsRecaptchaVerifying(false)
      }
    },
    [verifiedResponseData],
  )

  const handleRecaptchaError = useCallback(() => {
    setError("reCAPTCHA encountered an error. Please try again.")
    setIsRecaptchaVerifying(false)
    recaptchaRef.current?.reset()
  }, [])

  const handleFinalLoginSuccess = useCallback((responsePayload: { user: any; token?: string }) => {
    setVerifiedResponseData(responsePayload)
    setShowRecaptcha(true)
    setShowOtpModal(false)
  }, [])

  const handleResendOtp = useCallback(async (email: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/users/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        console.log("Resend OTP successful:", data.message)
        return true
      } else {
        console.error("Resend OTP failed:", data.message)
        return false
      }
    } catch (error) {
      console.error("Error during resend OTP:", error)
      return false
    }
  }, [])

  const closeStatusModal = () => {
    setModalVisible(false)
    setTimeout(() => setShowPendingWarning(false), 300)
  }

  const handleGoBackFromUnverifiedWarning = () => {
    setShowUnverifiedWarning(false)
    setShowFillAllPrompt(true)
  }

  const handleConfirmSkipUnverified = () => {
    setShowUnverifiedWarning(false)
    setCustomerMinimalMode(true)
    setAccountType("customer")
    setRegistrationStep("requirements")
    setShowModal(true)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideshowImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const modal = document.getElementById("register-modal")
      if (modal && !modal.contains(e.target as Node) && showModal) {
        setShowModal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showModal])

  useEffect(() => {
    if (
      showModal ||
      showTermsModal ||
      showOtpModal ||
      showPendingWarning ||
      showUnsuccessModal ||
      showSuccessModal ||
      showFillAllPrompt ||
      showUnverifiedWarning ||
      showForgotPasswordModal ||
      showRecaptcha // Added showRecaptcha to modal state management
    ) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [
    showModal,
    showTermsModal,
    showOtpModal,
    showPendingWarning,
    showUnsuccessModal,
    showSuccessModal,
    showFillAllPrompt,
    showUnverifiedWarning,
    showForgotPasswordModal,
    showRecaptcha, // Added showRecaptcha to dependency array
  ])

  useEffect(() => {
    setValidId(null)
    setSalaryCertificate(null)
    setUploadedDocuments({})
    setActiveCategoryIndex(0)
  }, [accountType])

  useEffect(() => {
    if (accountType === "ceo") {
      const initialDocuments: { [key: string]: File[] } = {}
      documentCategories.forEach((category) => {
        initialDocuments[category.id] = []
      })
      setUploadedDocuments(initialDocuments)
    }
  }, [accountType])

  const userItem = localStorage.getItem("user")
  const userData = userItem && userItem !== "undefined" ? JSON.parse(userItem) : {}
  const userStatus = userData.status || "pending"

  const getStatusContent = () => {
    switch (userStatus) {
      case "pending":
        return {
          icon: <Clock className="h-8 w-8 text-amber-500" />,
          title: "Account Pending Approval",
          description: "Your account is awaiting administrator approval. You'll be notified once approved.",
          color: "amber",
        }
      case "inactive":
        return {
          icon: <XCircle className="h-8 w-8 text-gray-500" />,
          title: "Account Inactive",
          description: "Your account is currently inactive. Please contact support to reactivate it.",
          color: "gray",
        }
      case "suspended":
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          title: "Account Suspended",
          description: "Your account has been suspended. Please contact our support team for assistance.",
          color: "red",
        }
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          title: "Account Status Issue",
          description: "There's an issue with your account. Please contact our support team for help.",
          color: "amber",
        }
    }
  }

  const statusContent = getStatusContent()

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail")
    const savedPassword = localStorage.getItem("savedPassword")
    if (savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setSaveCredentials(true)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (email && (!showPasswordField || password) && !loading) {
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.MouseEvent<HTMLButtonElement>
        handleLogin(syntheticEvent)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <style>{keyframes}</style>

      {/* Left side with image and description */}
      <div className="relative w-full md:w-1/2 overflow-hidden justify-center items-center p-2">
        <div className="relative h-full">
          <div className="relative h-full w-full rounded-full">
            {slideshowImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  activeSlide === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <img src={image.src || "/placeholder.svg"} className="object-cover w-full h-full rounded-br-[200px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center max-w-md mx-auto font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        <div className="mb-10 flex flex-col justify-center items-center">
          <div className="flex flex-col items-center gap-1 mt-6 text-gray-600">
            <img src={logo1 || "/placeholder.svg"} width={190} height={190} className="mt-[-50px] mb-5 mr-6" />
          </div>
          <h2 className="text-3xl font-medium text-sky-500">Welcome Back</h2>
          <p className="text-[14px] mt-2 mb-[-30px] text-gray-500">
            Enter your email and password to access your account
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button
              onClick={() => setShowPasswordField(!showPasswordField)}
              className="text-sm text-sky-500 hover:cursor-pointer text-right block w-full mt-1"
            >
              {showPasswordField ? "Use Magic Link Instead" : "Use Password Instead"}
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showPasswordField ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-1.5 pt-4">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            {showPasswordField && (
              <div className="flex justify-between items-center text-sm mt-2">
                <div className="flex items-center">
                  <input
                    id="save-credentials"
                    type="checkbox"
                    checked={saveCredentials}
                    onChange={(e) => {
                      const isChecked = e.target.checked
                      setSaveCredentials(isChecked)
                      if (!isChecked) {
                        localStorage.removeItem("savedEmail")
                        localStorage.removeItem("savedPassword")
                      }
                    }}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label htmlFor="save-credentials" className="ml-2 text-gray-700">
                    Save Login Credentials
                  </label>
                </div>
                <button onClick={() => setShowForgotPasswordModal(true)} className="text-sky-500 hover:cursor-pointer">
                  Forgot Password?
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleLogin}
            className={`w-full bg-gray-200 text-gray-500 hover:bg-gray-300 rounded-full h-12 font-medium transition-colors
    ${!email || (showPasswordField && !password) || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
            disabled={!email || (showPasswordField && !password) || loading}
          >
            {loading
              ? showPasswordField
                ? "Logging In..."
                : "Sending Link..."
              : showPasswordField
                ? "Login Using Password"
                : "Login Using Magic Link"}
          </button>
          {error && (
            <div
              className={`mt-2 text-sm text-center ${error.includes("Success") ? "text-green-500" : "text-red-500"}`}
            >
              {error}
            </div>
          )}

          <div className="text-center text-sm text-gray-500 mt-4">
            Don't have account?{" "}
            <button
              onClick={() => {
                if (Cookies.get("terms_accepted") === "true") {
                  setTermsAccepted(true)
                  setShowModal(true)
                } else {
                  setShowTermsModal(true)
                }
              }}
              className="font-medium hover:cursor-pointer text-sky-500 hover:text-gray-500 duration-300"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTP
        email={email}
        onClose={() => setShowOtpModal(false)}
        onOtpVerifiedSuccess={handleFinalLoginSuccess}
        visible={showOtpModal}
        onResendOtp={handleResendOtp}
      />

      {showRecaptcha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: 1 }}
          />

          <div
            className="relative bg-white/90 backdrop-blur-md rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all duration-300 transform"
            style={{
              opacity: 1,
              transform: "scale(1)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <button
              onClick={() => {
                setShowRecaptcha(false)
                setVerifiedResponseData(null)
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>

            <div className="px-6 py-8 bg-white">
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-700 text-center mb-4">Complete Security Check</h3>
                <p className="text-center text-gray-600 mb-6">Please complete the reCAPTCHA challenge to proceed.</p>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                  onSuccess={handleRecaptchaSuccess}
                  onError={handleRecaptchaError}
                />
                {isRecaptchaVerifying && (
                  <p className="text-center text-sm text-gray-500 mt-4">Verifying reCAPTCHA...</p>
                )}
                {error && (
                  <p
                    className={`text-center text-sm mt-4 ${error.includes("sent") ? "text-green-500" : "text-red-500"}`}
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            id="register-modal"
            className="bg-white rounded-xl w-full max-w-4xl p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => {
                setShowModal(false)
                setRegistrationStep("type")
                setAccountType(null)
                setTermsAccepted(false)
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>

            {registrationStep === "type" ? (
              <div className="py-8 px-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
                <h2 className="text-2xl font-medium text-gray-700 text-center mb-8">Select Account Type</h2>
                <div className="flex justify-center gap-6 mx-auto">
                  <button
                    onClick={() => {
                      if (termsAccepted) {
                        setShowFillAllPrompt(true)
                      } else {
                        setShowTermsModal(true)
                      }
                    }}
                    disabled={!termsAccepted}
                    className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all w-[13rem] cursor-pointer
                ${
                  termsAccepted ? "hover:border-sky-400 hover:bg-sky-50" : "opacity-50 cursor-not-allowed bg-gray-100"
                }`}
                  >
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-sky-500"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <h3 className="font-medium text-lg text-gray-700">Customer</h3>
                    <p className="text-sm text-gray-500 text-center mt-2">Book services easier than ever</p>
                  </button>

                  <button
                    onClick={() => {
                      setAccountType("coo")
                      setRegistrationStep("requirements")
                    }}
                    disabled={!termsAccepted}
                    className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all w-[13rem] cursor-pointer
                ${
                  termsAccepted ? "hover:border-sky-400 hover:bg-sky-50" : "opacity-50 cursor-not-allowed bg-gray-100"
                }`}
                  >
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-sky-500"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <h3 className="font-medium text-lg text-gray-700">COO</h3>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Chief Operating Officer, offer various services
                    </p>
                  </button>
                </div>
                <div className="mt-8 text-center text-sm text-gray-600 px-4">
                  <p className="mb-2">
                    By choosing an account type, you're taking the first step towards a seamless experience with
                    HandyGo. Whether you're looking to hire services or offer your expertise, our platform is designed
                    to connect you efficiently.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {accountType === "customer" ? (
                  <CustomerRequirements
                    onClose={() => setShowModal(false)}
                    parentModal={true}
                    minimalMode={customerMinimalMode}
                    accountType="customer"
                  />
                ) : accountType === "coo" ? (
                  <COORequirements accountType="coo" />
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      {showPendingWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: modalVisible ? 1 : 0 }}
            onClick={closeStatusModal}
          />

          <div
            className="relative bg-white/90 backdrop-blur-md rounded-2xl max-w-md w-full overflow-hidden transition-all duration-300 transform"
            style={{
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "scale(1)" : "scale(0.95)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className={`w-full flex justify-center pt-8 pb-2`}>
              <div className={`rounded-full p-4 bg-${statusContent.color}-50`}>{statusContent.icon}</div>
            </div>

            <div className="px-6 pb-6 pt-2">
              <h3 className="text-xl font-semibold text-center mb-2 font-['SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif]">
                {statusContent.title}
              </h3>

              <p className="text-center text-gray-600 mb-6 font-['SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif] text-sm leading-relaxed">
                {statusContent.description}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = "mailto:support@handygo.com")}
                  className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors duration-200 flex justify-center items-center"
                >
                  Contact Support
                </button>

                <button
                  onClick={closeStatusModal}
                  className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-full hover:bg-gray-300 transition-colors duration-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <TermsCondition
          onClose={(accepted: boolean) => {
            setShowTermsModal(false)
            if (accepted) {
              Cookies.set("terms_accepted", "true", { expires: 365 })
              setSuccessMessage(
                "Thank you for participating in our system! We wish you the best and a wonderful time on our platform.",
              )
              setShowSuccessModal(true)
              setTermsAccepted(true)
              setTimeout(() => {
                setShowSuccessModal(false)
                setShowModal(true)
              }, 1500)
            } else {
              Cookies.remove("terms_accepted")
              setUnsuccessMessage(
                "Sorry for making you dislike our terms and services. You cannot find a website just like us.",
              )
              setShowUnsuccessModal(true)
              setTermsAccepted(false)
            }
          }}
        />
      )}

      {showUnsuccessModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden transform transition-all border border-white/20 p-6"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <XCircle className="h-10 w-10 text-red-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
                Oh nooo! Something went wrong.
              </h3>

              <div className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                {unsuccessMessage.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>

              <button
                onClick={() => setShowUnsuccessModal(false)}
                className="px-8 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 active:scale-95 transition-all duration-200"
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="mx-auto max-w-md w-full bg-white rounded-3xl overflow-hidden transform transition-all border border-white/20 p-6"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
                You're good to go! Let's get started.
              </h3>

              <p
                className="text-gray-600 mb-6 text-sm leading-relaxed"
                style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}
              >
                {successMessage}
              </p>

              <div className="flex gap-3 w-full" style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    setIsCountdownActive(false)
                    setCountdown(0)
                  }}
                  disabled={isCountdownActive}
                  className={`flex-1 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    isCountdownActive
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-sky-500 text-white hover:bg-sky-600 active:scale-95"
                  }`}
                >
                  {isCountdownActive ? `Continue (${countdown}s)` : "Continue"}
                </button>

                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    setIsCountdownActive(false)
                    setCountdown(0)

                    const userItem = localStorage.getItem("user")
                    const userData = userItem && userItem !== "undefined" ? JSON.parse(userItem) : {}
                    const userAccountType = userData.accountType

                    let redirectPath = "/"
                    switch (userAccountType) {
                      case "customer":
                        redirectPath = "/"
                        break
                      case "coo":
                        redirectPath = "/coo"
                        break
                      case "admin":
                        redirectPath = "/admin"
                        break
                      case "provider":
                        redirectPath = "/provider"
                        break
                      default:
                        redirectPath = "/"
                    }

                    window.location.href = redirectPath
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 active:scale-95 transition-all duration-200"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFillAllPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 border border-white/20"
            style={{ animation: "slideInUp 0.4s ease-out" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-sky-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-700">Account Setup Options</h3>
              </div>
              <button
                onClick={() => {
                  setShowFillAllPrompt(false)
                  setShowModal(true)
                  setRegistrationStep("type")
                  setAccountType(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                To ensure full access to all features and services, we recommend completing all required information.
                However, you can choose to proceed with a basic account.
              </p>

              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <span className="font-medium">Full Registration:</span> Access to all booking features, verified
                  profile, and priority support.
                </li>
                <li>
                  <span className="font-medium">Basic Registration:</span> Limited features, unverified profile, and
                  restricted booking capabilities.
                </li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setCustomerMinimalMode(false)
                  setAccountType("customer")
                  setRegistrationStep("requirements")
                  setShowModal(true)
                  setShowFillAllPrompt(false)
                }}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
              >
                Fill All Requirements
              </button>
              <button
                onClick={() => {
                  setCustomerMinimalMode(true)
                  setAccountType("customer")
                  setRegistrationStep("requirements")
                  setShowModal(true)
                  setShowFillAllPrompt(false)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Skip Some (Unverified Account)
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnverifiedWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-6xl w-full p-6 border border-white/20"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <AlertCircle className="h-10 w-10 text-amber-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
                Warning: Unverified Account Limitations
              </h3>

              <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                If you skip verification, your account will remain unverified, which has the following limitations:
              </p>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center text-lg border-b pb-3 border-amber-200">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    Account Limitations
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-gray-800">Service Creation Restricted</h5>
                        <p className="text-gray-600 text-sm">
                          Unable to create or publish any services on the platform
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-gray-800">Unverified Badge</h5>
                        <p className="text-gray-600 text-sm">A visible unverified status badge on your profile</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-gray-800">Limited Visibility</h5>
                        <p className="text-gray-600 text-sm">Lower ranking and reduced visibility in search results</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-gray-800">Feature Restrictions</h5>
                        <p className="text-gray-600 text-sm">No access to premium features and advanced tools</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center text-lg border-b pb-3 border-gray-200">
                    <AlertCircle className="h-5 w-5 mr-2 text-gray-500" />
                    Example: Unverified Account View
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-900">Business Name</h5>
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Unverified
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm">@username</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">Service creation is disabled for unverified accounts</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Profile views: Limited</span>
                          <span className="text-gray-500">Search rank: Reduced</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col sm:flex-row gap-4 w-full"
                style={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}
              >
                <button
                  onClick={handleConfirmSkipUnverified}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all w-full sm:w-1/2 order-2 sm:order-1"
                >
                  Skip Anyway
                </button>
                <button
                  onClick={handleGoBackFromUnverifiedWarning}
                  className="px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 active:scale-95 transition-all duration-200 w-full sm:w-1/2 order-1 sm:order-2"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ForgotPassword visible={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} />
    </div>
  )
}
