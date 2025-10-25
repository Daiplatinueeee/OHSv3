import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react"
import ReCAPTCHA from "../Styles/Recaptcha"
import { verifyRecaptchaClient } from "../../../../server/Recaptcha/Recaptcha"
import axios from "axios"

interface OTPProps {
  email: string
  onClose: () => void
  onOtpVerifiedSuccess: (data: { user: any; token?: string }) => void
  visible: boolean
  onResendOtp: (email: string) => Promise<boolean>
}

const OTP: React.FC<OTPProps> = ({ email, onClose, onOtpVerifiedSuccess, visible, onResendOtp }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [resendDisabled, setResendDisabled] = useState(true)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [isRecaptchaVerifying, setIsRecaptchaVerifying] = useState(false)
  const [verifiedResponseData, setVerifiedResponseData] = useState<any | null>(null) 
  const recaptchaRef = useRef<any>(null) // Ref for the ReCAPTCHA component

  useEffect(() => {
    if (visible) {
      setTimeout(() => setModalVisible(true), 10)
      setCountdown(60) // Reset countdown when modal becomes visible
      setResendDisabled(true) // Disable resend immediately
      setOtp(Array(6).fill("")) // Clear OTP input
      setError("") // Clear any previous errors
      setSuccess(false) // Reset success state
      setShowRecaptcha(false) // Hide recaptcha initially
      setVerifiedResponseData(null) // Clear verified response data
      recaptchaRef.current?.reset() // Reset reCAPTCHA when modal opens
    } else {
      setModalVisible(false)
    }
  }, [visible])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
    if (modalVisible && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [modalVisible])

  useEffect(() => {
    if (!visible) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setResendDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [visible])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").trim().substring(0, 6)

    if (!pasteData || !/^\d+$/.test(pasteData)) return

    const newOtp = [...otp]

    for (let i = 0; i < pasteData.length; i++) {
      if (i >= 6) break
      newOtp[i] = pasteData[i]
    }

    setOtp(newOtp)

    const lastIndex = Math.min(pasteData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleResend = async () => {
    setCountdown(60)
    setResendDisabled(true)
    setError("")
    const success = await onResendOtp(email) // Use the prop function
    if (success) {
      setError("New code sent!")
    } else {
      setError("Failed to resend code. Please try again.")
    }
    setTimeout(() => setError(""), 3000)
  }

  const handleVerifyClick = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setError("")
    setIsVerifying(true)

    try {
      const token = localStorage.getItem("token")
      let endpoint = ""
      let requestBody: any = {}
      const headers: any = {
        "Content-Type": "application/json",
      }

      if (token) {
        endpoint = `http://localhost:3000/api/users/verify-email-code`
        headers["Authorization"] = `Bearer ${token}`

        // Decode token to get user ID
        try {
          const tokenPayload = JSON.parse(atob(token.split(".")[1]))
          requestBody = {
            email,
            code: otpValue, // Changed from 'otp' to 'code'
            userId: tokenPayload.userId || tokenPayload.id, // Try both common field names
          }
        } catch (decodeError) {
          setError("Invalid session. Please log in again.")
          localStorage.removeItem("token")
          return
        }
      } else {
        endpoint = `http://localhost:3000/api/users/verify-otp`
        requestBody = { email, otp: otpValue } // Keep 'otp' for login flow
      }

      const response = await axios.post(endpoint, requestBody, { headers })

      const data = response.data // Axios automatically parses JSON

      if (response.status === 200) {
        setVerifiedResponseData(data) // Store the entire data object (user + token)
        setShowRecaptcha(true) // Proceed to reCAPTCHA
        setError("") // Clear any previous errors
      } else {
        setError(data.message || "Invalid or expired code.") // Show error if code is wrong
        setOtp(Array(6).fill("")) // Clear OTP input on error
        inputRefs.current[0]?.focus() // Focus first input
      }
    } catch (err: any) {
      console.error("Verification error:", err)

      if (err.response?.status === 401) {
        if (err.response?.data?.message?.includes("expired")) {
          localStorage.removeItem("token") // Remove expired token
          setError("Session expired. Please log in again.")
        } else {
          setError("Invalid or expired verification code. Please try again.")
        }
      } else if (err.response?.status === 404) {
        setError("User not found. Please check your email address.")
      } else if (err.response?.status === 400) {
        // Handle bad request (invalid OTP)
        setError(err.response?.data?.message || "Invalid verification code. Please try again.")
        setOtp(Array(6).fill("")) // Clear OTP input on error
        inputRefs.current[0]?.focus() // Focus first input
      } else if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        // Handle network errors
        setError("Unable to connect to the server. Please check your connection and try again.")
      } else {
        // Generic error handling
        setError(err.response?.data?.message || "Failed to verify code. Please try again.")
        setOtp(Array(6).fill("")) // Clear OTP input on error
        inputRefs.current[0]?.focus() // Focus first input
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRecaptchaSuccess = useCallback(
    async (token: string) => {
      setIsRecaptchaVerifying(true)
      setError("")
      try {
        // Verify reCAPTCHA on the backend using your existing function
        const result = await verifyRecaptchaClient(token)

        if (result.success) {
          setSuccess(true)
          setTimeout(() => {
            if (verifiedResponseData) {
              const token = localStorage.getItem("token")
              if (token) {
                // Email verification successful for logged-in user
                console.log("Email verification successful for logged-in user")
              } else {
                // Login flow success - store new token if provided
                if (verifiedResponseData.token) {
                  localStorage.setItem("token", verifiedResponseData.token)
                }
              }
              onOtpVerifiedSuccess(verifiedResponseData) // Pass the stored full response data
            }
          }, 1500)
        } else {
          setError(result.message || "reCAPTCHA verification failed.")
          recaptchaRef.current?.reset() // Reset reCAPTCHA on failure
        }
      } catch (err: any) {
        console.error("Error during reCAPTCHA client verification:", err)
        setError(`Network error during reCAPTCHA verification: ${err.message}`)
        recaptchaRef.current?.reset() // Reset reCAPTCHA on network error
      } finally {
        setIsRecaptchaVerifying(false)
      }
    },
    [onOtpVerifiedSuccess, verifiedResponseData],
  )

  const handleRecaptchaError = useCallback(() => {
    setError("reCAPTCHA encountered an error. Please try again.")
    setIsRecaptchaVerifying(false)
    recaptchaRef.current?.reset() // Reset reCAPTCHA on error
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-opacity duration-300 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${visible ? "visible" : "invisible"}`}
      onClick={handleBackdropClick}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: modalVisible ? 1 : 0 }}
      />

      <div
        className="relative bg-white/90 backdrop-blur-md rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all duration-300 transform"
        style={{
          opacity: modalVisible ? 1 : 0,
          transform: modalVisible ? "scale(1)" : "scale(0.95)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10">
          <X size={20} />
          <span className="sr-only">Close</span>
        </button>

        <div className="px-6 py-8">
          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle2 className="h-10 w-10 text-green-500 animate-bounce" />
              </div>
              <h3 className="text-xl font-medium mb-2">Verified Successfully</h3>
              <p className="text-gray-600 mb-6">You have been successfully authenticated.</p>
            </div>
          ) : showRecaptcha ? (
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-700 text-center mb-4">Complete Security Check</h3>
              <p className="text-center text-gray-600 mb-6">Please complete the reCAPTCHA challenge.</p>
              {/* Using your custom ReCAPTCHA component */}
              <ReCAPTCHA
                ref={recaptchaRef} // Pass the ref here
                siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Use demo key as fallback
                onSuccess={handleRecaptchaSuccess}
                onError={handleRecaptchaError}
              />
              {isRecaptchaVerifying && <p className="text-center text-sm text-gray-500 mt-4">Verifying reCAPTCHA...</p>}
              {error && (
                <p className={`text-center text-sm mt-4 ${error.includes("sent") ? "text-green-500" : "text-red-500"}`}>
                  {error}
                </p>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-700 text-center mb-2">Verification Code</h3>
              <p className="text-center text-gray-600 mb-6">
                We've sent a 6-digit code to <span className="font-medium">{email}</span>
              </p>

              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {Array(6)
                  .fill(null)
                  .map((_, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    />
                  ))}
              </div>

              {error && (
                <div className="flex items-center justify-center text-center text-sm mb-4 text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleVerifyClick}
                  disabled={otp.join("").length !== 6 || isVerifying}
                  className={`w-full py-3 px-4 rounded-full font-medium flex items-center justify-center gap-2 ${
                    otp.join("").length !== 6 || isVerifying
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-sky-500 text-white hover:bg-sky-600"
                  }`}
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                  {!isVerifying && <ArrowRight size={18} />}
                </button>

                <div className="text-center">
                  <p className="text-gray-500 text-sm">
                    Didn't receive the code?{" "}
                    <button
                      onClick={handleResend}
                      disabled={resendDisabled}
                      className={`font-medium ${
                        resendDisabled ? "text-gray-400 cursor-not-allowed" : "text-sky-500 hover:text-sky-600"
                      }`}
                    >
                      {resendDisabled ? `Resend in ${countdown}s` : "Resend code"}
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OTP