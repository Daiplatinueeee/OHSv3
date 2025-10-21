"use client"

import { Check, CheckCircle } from "lucide-react"

interface DestinationReachedModalProps {
  modalState: "hidden" | "destination" | "waiting" | "complete"
  customerName: string
  customerLocation: string
  isProcessingService: boolean
  customerReview: string
  customerRating: number
  onClose: () => void
  onCompleteService: () => void
  onSubmitReview: () => void
  onReviewChange: (review: string) => void
  onRatingChange: (rating: number) => void
}

export default function DestinationReachedModal({
  modalState,
  customerName,
  customerLocation,
  isProcessingService,
  customerReview,
  customerRating,
  onClose,
  onCompleteService,
  onSubmitReview,
  onReviewChange,
  onRatingChange,
}: DestinationReachedModalProps) {
  if (modalState === "hidden") return null

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div
        className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
        style={{ animation: "fadeIn 0.5s ease-out" }}
      >
        {modalState === "destination" && (
          <div className="flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
              style={{ animation: "pulse 2s ease-in-out infinite" }}
            >
              <Check className="h-10 w-10 text-green-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
            </div>

            <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
              Destination Reached!
            </h3>

            <p className="text-gray-600 mb-4" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              You have successfully reached {customerName}'s location.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg text-left mb-6 w-full border border-gray-200">
              <div className="mb-2">
                <span className="font-medium">Customer:</span> {customerName}
              </div>
              <div className="mb-2">
                <span className="font-medium">Location:</span> {customerLocation}
              </div>
              <div className="mb-2">
                <span className="font-medium">Arrival Time:</span> {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-full font-medium shadow-sm hover:bg-gray-300 active:scale-95 transition-all duration-200"
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                Close
              </button>
              <button
                onClick={() => onCompleteService()}
                disabled={isProcessingService}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200 disabled:opacity-50"
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                {isProcessingService ? "Processing..." : "Complete Service"}
              </button>
            </div>
          </div>
        )}

        {modalState === "waiting" && (
          <div className="flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6"
              style={{ animation: "pulse 2s ease-in-out infinite" }}
            >
              <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>

            <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
              Waiting for Customer
            </h3>

            <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              Please wait while the customer confirms the service completion.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium shadow-sm hover:bg-gray-300 active:scale-95 transition-all duration-200"
              style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
            >
              Close
            </button>
          </div>
        )}

        {modalState === "complete" && (
          <div className="flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
              style={{ animation: "pulse 2s ease-in-out infinite" }}
            >
              <CheckCircle className="h-10 w-10 text-green-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
            </div>

            <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
              Service Complete!
            </h3>

            <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              The customer has confirmed the service completion. Please provide your feedback.
            </p>

            <div className="w-full space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate your experience (1-5 stars)</label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => onRatingChange(star)}
                      className={`text-2xl transition-colors ${
                        star <= customerRating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional comments (optional)</label>
                <textarea
                  value={customerReview}
                  onChange={(e) => onReviewChange(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-full font-medium shadow-sm hover:bg-gray-300 active:scale-95 transition-all duration-200"
              >
                Skip
              </button>
              <button
                onClick={onSubmitReview}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
