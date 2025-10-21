"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, AlertTriangle, XCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import CustomerRequirements from "./Styles/CustomerRequirements"
import COORequirements from "./Styles/COORequirements"
import OTP from "../sections/Styles/OTP"
import TermsCondition from "../sections/Styles/TermsCondition"
import Cookies from "js-cookie"
import ForgotPassword from "../sections/Styles/ForgotPassword"
import logo1 from "@/assets/Home/undraw_traveling_c18z.png"

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
  const [showModal, setShowModal] = useState(false) // State for Select Account Type modal
  const [accountType, setAccountType] = useState<string | null>(null)
  const [registrationStep, setRegistrationStep] = useState<"type" | "requirements">("type")
  const [showPendingWarning, setShowPendingWarning] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false) // State for TermsCondition modal
  const [showUnsuccessModal, setShowUnsuccessModal] = useState(false) // State for unsuccess modal
  const [unsuccessMessage, setUnsuccessMessage] = useState("") // Message for unsuccess modal
  const [showSuccessModal, setShowSuccessModal] = useState(false) // State for success modal
  const [successMessage, setSuccessMessage] = useState("") // Message for success modal
  const [termsAccepted, setTermsAccepted] = useState(() => Cookies.get("terms_accepted") === "true") // New state to track terms acceptance
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false) // New state for ForgotPassword modal

  const [, setValidId] = useState<File | null>(null)
  const [, setSalaryCertificate] = useState<File | null>(null)
  const [, setUploadedDocuments] = useState<{ [key: string]: File[] }>({})
  const [, setActiveCategoryIndex] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // New states for customer registration flow
  const [showFillAllPrompt, setShowFillAllPrompt] = useState(false)
  const [showUnverifiedWarning, setShowUnverifiedWarning] = useState(false)
  const [customerMinimalMode, setCustomerMinimalMode] = useState(false)

  const [countdown, setCountdown] = useState(0)
  const [isCountdownActive, setIsCountdownActive] = useState(false)

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
        console.log("Server response data (password login):", data) // Debugging log

        if (response.ok) {
          setSuccessMessage(
            "Please take a moment to review our policies, terms of service, and important safety guidelines to prevent any unnecessary incidents and ensure a smooth experience.",
          )
          setShowSuccessModal(true)
          setIsCountdownActive(true)
          setCountdown(20)

          // Store user data and token separately
          localStorage.setItem("user", JSON.stringify(data.user))
          if (data.token) {
            localStorage.setItem("token", data.token)
            console.log("Token saved to localStorage:", data.token) // Debugging log
          } else {
            console.warn("No token received from password login response.") // Debugging log
          }

          // --- START ADDITION FOR SAVE CREDENTIALS ---
          if (saveCredentials) {
            // WARNING: Storing passwords directly in localStorage is not recommended for production
            // applications due to security risks (e.g., XSS attacks).
            // For a production environment, consider more secure methods like
            // server-side sessions, secure HTTP-only cookies, or token-based authentication
            // where the token is stored securely.
            localStorage.setItem("savedEmail", email)
            localStorage.setItem("savedPassword", password)
          } else {
            localStorage.removeItem("savedEmail")
            localStorage.removeItem("savedPassword")
          }
          // --- END ADDITION FOR SAVE CREDENTIALS ---

          const userAccountType = data.user.accountType
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
                window.location.href = redirectPath
                return 0
              }
              return prev - 1
            })
          }, 1000)
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
        console.log("Server response data (send OTP):", data) // Debugging log

        if (response.ok) {
          setSuccessMessage(data.message)
          setShowSuccessModal(true)
          setTimeout(() => {
            setShowSuccessModal(false)
            setShowOtpModal(true) // Show OTP modal after sending link
          }, 1500)
        } else {
          // Handle specific error for email not registered
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

  const handleFinalLoginSuccess = useCallback((responsePayload: { user: any; token?: string }) => {
    setSuccessMessage(
      "OTP verified successfully! Please take a moment to review our policies, terms of service, and important safety guidelines to prevent any unnecessary incidents and ensure a smooth experience.",
    )
    setShowSuccessModal(true)
    setIsCountdownActive(true)
    setCountdown(20)

    // Store user data and token separately
    localStorage.setItem("user", JSON.stringify(responsePayload.user))
    if (responsePayload.token) {
      localStorage.setItem("token", responsePayload.token)
      console.log("Token saved to localStorage from OTP verification:", responsePayload.token) // Debugging log
    } else {
      console.warn("No token received from OTP verification response.") // Debugging log
    }
    setShowOtpModal(false) // Close OTP modal

    const userAccountType = responsePayload.user.accountType
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
          window.location.href = redirectPath
          return 0
        }
        return prev - 1
      })
    }, 1000)
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
    setShowFillAllPrompt(true) // Go back to the previous prompt
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
    // This effect now correctly manages body overflow based on any modal being open
    if (
      showModal ||
      showTermsModal ||
      showOtpModal ||
      showPendingWarning ||
      showUnsuccessModal ||
      showSuccessModal ||
      showFillAllPrompt || // Include new modals
      showUnverifiedWarning || // Include new modals
      showForgotPasswordModal // Include ForgotPassword modal
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
  ]) // Include all modal states

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
      // Only proceed if form is valid (same validation as button)
      if (email && (!showPasswordField || password) && !loading) {
        // Create a synthetic mouse event to match the existing handleLogin signature
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.MouseEvent<HTMLButtonElement>
        handleLogin(syntheticEvent)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Include animation keyframes */}
      <style>{keyframes}</style>

      {/* Left side with image and description */}
      <div className="relative w-full md:w-1/2 overflow-hidden justify-center items-center p-2">
        <div className="relative h-full">
          {/* Slideshow */}
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
            <img src={logo1 || "/placeholder.svg"} width={190} height={190} className="mt-[-25px]" />
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
              onKeyDown={handleKeyDown} // Added Enter key handler
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button
              onClick={() => setShowPasswordField(!showPasswordField)}
              className="text-sm text-sky-500 hover:cursor-pointer text-right block w-full mt-1"
            >
              {showPasswordField ? "Use Magic Link Instead" : "Use Password Instead"}
            </button>
          </div>
          {/* Password field with animation */}
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
                onKeyDown={handleKeyDown} // Added Enter key handler
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
          <div className="relative flex items-center justify-center text-xs text-gray-500 my-4 ">
            <span className="bg-white px-2 mt-10">or sign in with</span>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 rounded-full text-sm font-medium border border-gray-300 py-2 hover:bg-gray-50 transition-colors hover:cursor-pointer hover:border-sky-500 hover:text-sky-500 duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18.1711 8.36788H17.5V8.33329H10V11.6666H14.6789C14.0454 13.6063 12.1909 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C11.2843 5 12.4565 5.48078 13.3569 6.28118L15.8211 3.81705C14.2709 2.32555 12.2539 1.42857 10 1.42857C5.25329 1.42857 1.42857 5.25329 1.42857 10C1.42857 14.7467 5.25329 18.5714 10 18.5714C14.7467 18.5714 18.5714 14.7467 18.5714 10C18.5714 9.43363 18.5214 8.88263 18.4257 8.34933L18.1711 8.36788Z"
                  fill="#FFC107"
                />
                <path
                  d="M2.62891 6.12416L5.5049 8.23416C6.25462 6.38155 7.9907 5 10.0003 5C11.2846 5 12.4568 5.48078 13.3572 6.28118L15.8214 3.81705C14.2712 2.32555 12.2542 1.42857 10.0003 1.42857C6.75891 1.42857 3.95498 3.39048 2.62891 6.12416Z"
                  fill="#FF3D00"
                />
                <path
                  d="M9.99968 18.5714C12.2018 18.5714 14.1761 17.7053 15.7129 16.2643L12.9975 13.9857C12.1368 14.6394 10.9979 15 9.99968 15C7.81968 15 5.97168 13.6161 5.33168 11.6875L2.49268 13.8946C3.80332 16.6768 6.64368 18.5714 9.99968 18.5714Z"
                  fill="#4CAF50"
                />
                <path
                  d="M18.1711 8.36795H17.5V8.33337H10V11.6667H14.6789C14.3746 12.5902 13.8055 13.3973 13.0578 13.9867L13.0589 13.986L15.7743 16.2646C15.6057 16.4196 18.5714 14.1667 18.5714 10.0001C18.5714 9.4337 18.5214 8.8827 18.4257 8.3494L18.1711 8.36795Z"
                  fill="#1976D2"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 rounded-full text-sm font-medium border border-gray-300 py-2 hover:bg-gray-50 transition-colors hover:cursor-not-allowed">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14.0756 10.5C14.0654 9.25225 14.6607 8.10938 15.6725 7.4165C15.0908 6.54163 14.1432 5.97488 13.1166 5.9165C12.0287 5.80925 10.8854 6.56188 10.3332 6.56188C9.74844 6.56188 8.7666 5.94275 7.91094 5.94275C6.42969 5.96675 4.82656 7.07613 4.82656 9.34275C4.82656 10.0166 4.94219 10.7155 5.17344 11.4395C5.49531 12.4155 6.74219 15.2249 8.04219 15.1916C8.84844 15.1749 9.39844 14.6124 10.4332 14.6124C11.4322 14.6124 11.9412 15.1916 12.8412 15.1916C14.1578 15.1749 15.2791 12.6082 15.5834 11.6291C13.8537 10.8207 14.0756 10.5498 14.0756 10.5Z"
                  fill="black"
                />
                <path
                  d="M12.3084 4.6875C12.8209 4.06838 13.1178 3.25325 13.0459 2.5C12.2709 2.5835 11.5584 2.9585 11.0334 3.56675C10.5459 4.12263 10.2178 4.9585 10.3053 5.6875C11.1428 5.7335 11.7959 5.30663 12.3084 4.6875Z"
                  fill="black"
                />
              </svg>
              Apple ID
            </button>
          </div>
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
              className="font-medium text-black hover:cursor-pointer hover:text-sky-500 duration-300"
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
        onOtpVerifiedSuccess={handleFinalLoginSuccess} // Changed prop name and function
        visible={showOtpModal}
        onResendOtp={handleResendOtp} // Pass the new resend function
      />

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
                setTermsAccepted(false) // Reset terms acceptance on modal close
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
                        setShowFillAllPrompt(true) // Show the new prompt first
                      } else {
                        setShowTermsModal(true)
                      }
                    }}
                    disabled={!termsAccepted} // Disabled if terms not accepted
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
                    disabled={!termsAccepted} // Disabled if terms not accepted
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

      {/* Swift UI / Apple-inspired Status Modal */}
      {showPendingWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur effect */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: modalVisible ? 1 : 0 }}
            onClick={closeStatusModal}
          />

          {/* Modal card with Apple-inspired design */}
          <div
            className="relative bg-white/90 backdrop-blur-md rounded-2xl max-w-md w-full overflow-hidden transition-all duration-300 transform"
            style={{
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "scale(1)" : "scale(0.95)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Status icon at top */}
            <div className={`w-full flex justify-center pt-8 pb-2`}>
              <div className={`rounded-full p-4 bg-${statusContent.color}-50`}>{statusContent.icon}</div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-2">
              <h3 className="text-xl font-semibold text-center mb-2 font-['SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif]">
                {statusContent.title}
              </h3>

              <p className="text-center text-gray-600 mb-6 font-['SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif] text-sm leading-relaxed">
                {statusContent.description}
              </p>

              {/* Apple-style buttons */}
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

      {/* Render TermsCondition Modal */}
      {showTermsModal && (
        <TermsCondition
          onClose={(accepted: boolean) => {
            setShowTermsModal(false) // Close the terms modal
            if (accepted) {
              Cookies.set("terms_accepted", "true", { expires: 365 }) // Store for 1 year
              setSuccessMessage(
                "Thank you for participating in our system! We wish you the best and a wonderful time on our platform.",
              )
              setShowSuccessModal(true) // Show the success modal
              setTermsAccepted(true) // Set terms as accepted
              // After a short delay, open the account type modal
              setTimeout(() => {
                setShowSuccessModal(false) // Dismiss success modal
                setShowModal(true) // Open the account type modal
              }, 1500) // Adjust delay as needed
            } else {
              // If terms were not accepted (i.e., Cancel was clicked)
              Cookies.remove("terms_accepted") // Remove the cookie if terms are not accepted
              setUnsuccessMessage(
                "Sorry for making you dislike our terms and services. You cannot find a website just like us.",
              )
              setShowUnsuccessModal(true) // Show the unsuccess modal
              setTermsAccepted(false) // Ensure terms are not accepted
            }
          }}
        />
      )}

      {/* Unsuccess Modal (based on Transaction.tsx success modal) */}
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
                Terms Not Accepted
              </h3>

              <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                {unsuccessMessage}
              </p>

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
                Welcome Aboard!
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

                    // Get user data and redirect immediately
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

      {/* New: Fill All Requirements Prompt Modal */}
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
                {/* Left Column - Limitations */}
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

                {/* Right Column - Example Account */}
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

      {/* Forgot Password Modal */}
      <ForgotPassword visible={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} />
    </div>
  )
}