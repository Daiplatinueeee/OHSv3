import { useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { AlertCircle } from "lucide-react"

interface AccountSuspensionModalProps {
  isOpen: boolean
  redirectUrl: string
}

export function AccountSuspensionModal({ isOpen, redirectUrl }: AccountSuspensionModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, redirectUrl])

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}} // Intentionally empty to prevent closing
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-red-200 p-6 animate-[shakeX_0.8s_ease-in-out]">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 animate-[pulse_1s_ease-in-out_infinite]">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>

            <Dialog.Title className="text-xl font-bold text-red-600 mb-2">Account Suspended!</Dialog.Title>
            <p className="text-gray-700 mb-2">
              Due to three cancellation strikes, your account has been suspended for 1 year.
            </p>
            <p className="text-gray-500 mb-6">You will be redirected to login in 30 seconds...</p>

            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
              <div className="bg-red-500 h-1.5 rounded-full animate-[countdown_30s_linear_forwards]"></div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}