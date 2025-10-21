import { Dialog } from "@headlessui/react"
import { AlertCircle, CheckCircle2, Users } from "lucide-react"

interface StatusMessageModalProps {
  isOpen: boolean
  onClose: () => void
  successMessage: string
}

export function StatusMessageModal({ isOpen, onClose, successMessage }: StatusMessageModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        <Dialog.Panel
          className={`mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border ${successMessage.includes("cancelled") ? "border-yellow-200" : "border-white/20"} p-6 animate-[fadeIn_0.5s_ease-out]`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-20 h-20 rounded-full ${
                successMessage.includes("cancelled")
                  ? "bg-yellow-100"
                  : successMessage.includes("Waiting")
                    ? "bg-blue-100"
                    : "bg-green-100"
              } flex items-center justify-center mb-6 animate-[pulse_2s_ease-in-out_infinite]`}
            >
              {successMessage.includes("cancelled") ? (
                <AlertCircle className="h-10 w-10 text-yellow-500 animate-[bounceIn_0.6s_ease-out]" />
              ) : successMessage.includes("Waiting") ? (
                <Users className="h-10 w-10 text-blue-500 animate-[bounceIn_0.6s_ease-out]" />
              ) : (
                <CheckCircle2 className="h-10 w-10 text-green-500 animate-[bounceIn_0.6s_ease-out]" />
              )}
            </div>

            <Dialog.Title
              className={`text-xl font-medium ${
                successMessage.includes("cancelled")
                  ? "text-yellow-600"
                  : successMessage.includes("Waiting")
                    ? "text-blue-600"
                    : "text-gray-900"
              } mb-2 animate-[slideInUp_0.4s_ease-out]`}
            >
              {successMessage.includes("cancelled")
                ? "Warning"
                : successMessage.includes("Waiting")
                  ? "Worker Assigned"
                  : "Success!"}
            </Dialog.Title>
            <p className="text-gray-600 mb-6 animate-[fadeIn_0.5s_ease-out_0.2s_both]">{successMessage}</p>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 font-medium text-sm animate-[fadeIn_0.5s_ease-out_0.3s_both]"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}