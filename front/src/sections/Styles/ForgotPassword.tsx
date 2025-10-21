import { useState } from "react"
import { X, ArrowLeft, LockKeyhole, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ForgotPasswordModalProps {
  visible: boolean
  onClose: () => void
}

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

export default function ForgotPassword({ visible, onClose }: ForgotPasswordModalProps) {
  // currentPage: 1 (Email), 2 (Choose Method), 3 (Secret Answer), 4 (Secret Code), 5 (Reset Password)
  const [currentPage, setCurrentPage] = useState(1)
  const [email, setEmail] = useState("")
  const [secretQuestion, setSecretQuestion] = useState<string | null>(null)
  const [hasSecretAnswerOption, setHasSecretAnswerOption] = useState(false)
  const [hasSecretCodeOption, setHasSecretCodeOption] = useState(false)
  const [secretAnswer, setSecretAnswer] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const resetForm = () => {
    setCurrentPage(1)
    setEmail("")
    setSecretQuestion(null)
    setHasSecretAnswerOption(false)
    setHasSecretCodeOption(false)
    setSecretAnswer("")
    setSecretCode("")
    setNewPassword("")
    setConfirmNewPassword("")
    setError("")
    setLoading(false)
    setShowSuccessModal(false)
    setSuccessMessage("")
  }

  const handleEmailSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/api/users/forgot-password/fetch-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSecretQuestion(data.secretQuestion)
        setHasSecretAnswerOption(data.hasSecretAnswer)
        setHasSecretCodeOption(data.hasSecretCode)

        if (data.hasSecretAnswer || data.hasSecretCode) {
          setCurrentPage(2) // Go to choose method page
        } else {
          setError("No recovery options (secret question or code) found for this email.")
        }
      } else {
        setError(data.message || "Failed to fetch account details. Please try again.")
      }
    } catch (err) {
      console.error("Error fetching secret details:", err)
      setError("Failed to connect to the server. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSecretAnswerSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/api/users/forgot-password/verify-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, answer: secretAnswer }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCurrentPage(5) // Go to reset password page
      } else {
        setError(data.message || "Incorrect secret answer. Please try again.")
      }
    } catch (err) {
      console.error("Error verifying secret answer:", err)
      setError("Failed to connect to the server. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSecretCodeSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/api/users/forgot-password/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: secretCode }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCurrentPage(5) // Go to reset password page
      } else {
        setError(data.message || "Incorrect secret code. Please try again.")
      }
    } catch (err) {
      console.error("Error verifying secret code:", err)
      setError("Failed to connect to the server. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setError("")
    setLoading(true)
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/forgot-password/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage(data.message || "Your password has been reset successfully!")
        setShowSuccessModal(true)
      } else {
        setError(data.message || "Failed to reset password. Please try again.")
      }
    } catch (err) {
      console.error("Error resetting password:", err)
      setError("Failed to connect to the server. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setError("") // Clear error on back
    if (currentPage === 5) {
      setCurrentPage(2) // Back from reset password to choose method
    } else if (currentPage === 4 || currentPage === 3) {
      setCurrentPage(2) // Back from secret answer/code to choose method
    } else if (currentPage === 2) {
      setCurrentPage(1) // Back from choose method to email
    }
  }

  const handleSuccessModalClose = () => {
    resetForm()
    onClose() // Close the main ForgotPassword modal
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      {/* Include animation keyframes */}
      <style>{keyframes}</style>

      <Card
        className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
        style={{ animation: "fadeIn 0.5s ease-out" }}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10">
          <X size={20} />
          <span className="sr-only">Close</span>
        </button>

        {currentPage > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="absolute left-4 top-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}

        {/* Icon - centered using mx-auto */}
        <div
          className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-6"
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          <LockKeyhole className="h-10 w-10 text-sky-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
        </div>

        {/* CardHeader - text content will be left-aligned by default */}
        <CardHeader className="space-y-1 p-0 mb-6 text-center">
          <CardTitle
            className="text-xl font-medium text-gray-700 mb-2 whitespace-nowrap"
            style={{ animation: "slideInUp 0.4s ease-out" }}
          >
            Forgot Password
          </CardTitle>
          {currentPage === 1 && (
            <CardDescription className="text-gray-600" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              Enter your email to find your account.
            </CardDescription>
          )}
          {currentPage === 2 && (
            <CardDescription className="text-gray-600" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              Choose a verification method.
            </CardDescription>
          )}
          {currentPage === 3 && (
            <CardDescription className="text-gray-600" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              Answer your secret question.
            </CardDescription>
          )}
          {currentPage === 4 && (
            <CardDescription className="text-gray-600" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              Enter your secret code.
            </CardDescription>
          )}
          {currentPage === 5 && (
            <CardDescription className="text-gray-600" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              Set your new password.
            </CardDescription>
          )}
        </CardHeader>

        {/* CardContent - input and button will take full width and align as expected */}
        <CardContent className="w-full p-0">
          {currentPage === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <Button
                onClick={handleEmailSubmit}
                className="w-full px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                disabled={loading || !email}
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                {loading ? "Loading..." : "Next"}
              </Button>
            </div>
          )}

          {currentPage === 2 && (
            <div className="space-y-4">
              {hasSecretAnswerOption && (
                <Button
                  onClick={() => setCurrentPage(3)}
                  className="w-full px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                  style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
                >
                  Use Secret Question
                </Button>
              )}
              {hasSecretCodeOption && (
                <Button
                  onClick={() => setCurrentPage(4)}
                  variant="outline"
                  className="w-full px-8 py-3 border border-gray-300 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all"
                  style={{ animation: `fadeIn 0.5s ease-out ${hasSecretAnswerOption ? "0.4s" : "0.3s"} both` }}
                >
                  Use Secret Code
                </Button>
              )}
              {!hasSecretAnswerOption && !hasSecretCodeOption && (
                <div className="text-center text-gray-600 flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  No recovery options available for this account.
                </div>
              )}
            </div>
          )}

          {currentPage === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret-question" className="text-gray-700">
                  Secret Question
                </Label>
                <Input
                  id="secret-question"
                  type="text"
                  value={secretQuestion || "No secret question found."}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret-answer" className="text-gray-700">
                  Your Answer
                </Label>
                <Input
                  id="secret-answer"
                  type="text"
                  placeholder="Enter your answer"
                  value={secretAnswer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <Button
                onClick={handleSecretAnswerSubmit}
                className="w-full px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                disabled={loading || !secretAnswer}
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                {loading ? "Verifying..." : "Submit"}
              </Button>
            </div>
          )}

          {currentPage === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret-code" className="text-gray-700">
                  Secret Code
                </Label>
                <Input
                  id="secret-code"
                  type="text"
                  placeholder="Enter your secret code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <Button
                onClick={handleSecretCodeSubmit}
                className="w-full px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                disabled={loading || !secretCode}
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                {loading ? "Verifying..." : "Submit"}
              </Button>
            </div>
          )}

          {currentPage === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-700">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-gray-700">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <Button
                onClick={handlePasswordReset}
                className="w-full px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                disabled={loading || !newPassword || !confirmNewPassword}
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          )}

          {error && (
            <div
              className={`mt-4 text-sm text-center text-red-500`}
              style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}
            >
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
                Success!
              </h3>

              <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                {successMessage}
              </p>

              <Button
                onClick={handleSuccessModalClose}
                className="px-8 py-3 bg-sky-500 text-white rounded-full font-medium shadow-sm hover:bg-sky-600 active:scale-95 transition-all duration-200"
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}