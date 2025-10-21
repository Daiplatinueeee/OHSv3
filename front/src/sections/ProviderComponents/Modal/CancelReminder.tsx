import { Dialog } from "@headlessui/react"
import { AlertCircle } from "lucide-react"

interface CancelReminderModalProps {
  isOpen: boolean
  onClose: () => void
  cancelCount: number
  confirmCancelService: () => void
}

export function CancelReminderModal({ isOpen, onClose, cancelCount, confirmCancelService }: CancelReminderModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-yellow-200 p-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-yellow-500" />
            </div>

            <Dialog.Title className="text-xl font-medium text-gray-900 mb-2">Cancellation Warning</Dialog.Title>
            <p className="text-gray-600 mb-2">You are about to cancel this service.</p>
            <p className="text-yellow-600 font-medium mb-6">
              You have {2 - cancelCount} cancellation{cancelCount === 1 ? "" : "s"} remaining before your account is
              suspended.
            </p>

            <div className="flex space-x-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
              >
                Go Back
              </button>
              <button
                onClick={confirmCancelService}
                className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-200 font-medium text-sm"
              >
                Proceed with Cancellation
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}