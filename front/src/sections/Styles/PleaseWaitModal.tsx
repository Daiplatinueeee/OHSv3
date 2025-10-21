import { Dialog } from "@headlessui/react"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DialogTitle } from "@headlessui/react"

interface PleaseWaitModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export default function PleaseWaitModal({ isOpen, onClose, message }: PleaseWaitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-md"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 font-sans">
            <motion.div
              className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform border border-white/20 p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mb-6"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                >
                  <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
                </motion.div>

                <DialogTitle className="text-xl font-medium text-gray-900 mb-2">Please Wait...</DialogTitle>

                <motion.p
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                >
                  {message}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}