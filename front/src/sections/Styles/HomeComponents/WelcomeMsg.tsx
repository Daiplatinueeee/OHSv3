import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactConfetti from "react-confetti"

import img1 from '../../../assets/Home/undraw_pay-with-credit-card_77g6.png';
import img2 from '../../../assets/Home/undraw_my-current-location_tudq.png';
import img3 from '../../../assets/Home/undraw_completed_0sqh.png';
import img4 from '../../../assets/Home/undraw_relaxation_ies6.png';
import img5 from '../../../assets/Home/undraw_world_bdnk.png';

interface WelcomeModalProps {
    isOpen: boolean
    onClose: () => void
    onDoNotShowAgain: () => void
}

const welcomePages = [
    {
        title: "Welcome to Our Service!",
        description: "We're thrilled to have you join our community. Get ready to experience seamless home services.",
        image: img1,
    },
    {
        title: "Discover a Wide Range of Services",
        description: "From cleaning to repairs, find trusted professionals for all your needs, all in one place.",
        image: img2,
    },
    {
        title: "Easy Booking & Tracking",
        description: "Book services in a few taps and track your provider's progress in real-time for peace of mind.",
        image: img3,
    },
    {
        title: "Ready to Get Started?",
        description: "Explore our services, find the perfect provider, and make your home life easier today!",
        image: img4,
    },
]

export default function WelcomeModal({ isOpen, onClose, onDoNotShowAgain }: WelcomeModalProps) {
    const totalPages = welcomePages.length
    const [currentPage, setCurrentPage] = useState(0)
    const [slideDirection, setSlideDirection] = useState<"next" | "prev" | null>(null)
    const [showConfettiScreen, setShowConfettiScreen] = useState(false)
    const [runConfetti, setRunConfetti] = useState(false) // State to control confetti

    useEffect(() => {
        if (!isOpen) {
            setCurrentPage(0) // Reset page when modal closes
            setShowConfettiScreen(false) // Reset confetti screen state
            setSlideDirection(null)
            setRunConfetti(false) // Stop confetti when modal closes
        }
    }, [isOpen])

    useEffect(() => {
        if (showConfettiScreen) {
            setRunConfetti(true)
            // Stop confetti after 5 seconds
            const timer = setTimeout(() => {
                setRunConfetti(false)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [showConfettiScreen])

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setSlideDirection("next")
            setCurrentPage((prev) => prev + 1)
        } else {
            setShowConfettiScreen(true) // Transition to confetti screen on last page
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setSlideDirection("prev")
            setCurrentPage((prev) => prev - 1)
        }
    }

    const handleAnimationEnd = () => {
        setSlideDirection(null) // Reset direction after animation
    }

    if (!isOpen) return null

    const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInFromLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`

    const currentPageContent = welcomePages[currentPage]

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]"
            style={{ animation: "fadeIn 0.3s ease-out" }}
        >
            <style>{keyframes}</style>
            <div
                className="mx-auto max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6 text-center relative" // Changed to bg-white
                style={{ animation: "fadeIn 0.5s ease-out" }}
            >
                {showConfettiScreen ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 relative overflow-hidden">
                        {runConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}
                        <img
                            src={img5}
                            alt="Celebration illustration"
                            className="w-70 h-50 object-fit mb-6 z-10"
                            style={{ animation: "slideInUp 0.6s ease-out" }}
                        />
                        <h3 className="text-3xl text-gray-900 mb-4 z-10" style={{ animation: "slideInUp 0.6s ease-out" }}>
                            Welcome User
                        </h3>
                        <p className="text-[1rem] text-gray-700 mb-8 z-10" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                            Get the full experience using our website!
                            <br />
                            Rest assured, our website is fully responsive, ensuring a seamless experience across all your devices. You
                            can continue to use our services with ease, no matter how you access us.
                        </p>
                        <Button className="bg-sky-500 text-white hover:bg-sky-600 w-full z-10" onClick={onClose}>
                            Continue
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white text-gray-700 hover:bg-gray-100 w-full mt-3 z-10"
                            onClick={onDoNotShowAgain}
                        >
                            Do not show again
                        </Button>
                    </div>
                ) : (
                    <div
                        className={`flex flex-col items-center ${slideDirection === "next" ? "animate-slideInFromRight" : slideDirection === "prev" ? "animate-slideInFromLeft" : ""}`}
                        onAnimationEnd={handleAnimationEnd}
                    >
                        <img
                            src={currentPageContent.image || "/placeholder.svg"}
                            alt="Welcome illustration"
                            className="w-64 h-64 object-contain mb-6"
                            style={{ animation: "slideInUp 0.4s ease-out" }}
                        />
                        <h3
                            className="text-2xl text-gray-700 mb-3"
                            style={{ animation: "slideInUp 0.4s ease-out 0.1s both" }}
                        >
                            {currentPageContent.title}
                        </h3>
                        <p className="text-gray-700 mb-8" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                            {currentPageContent.description}
                        </p>

                        {/* Pagination Dots */}
                        <div className="flex space-x-2 mb-8">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (index > currentPage) setSlideDirection("next")
                                        else if (index < currentPage) setSlideDirection("prev")
                                        setCurrentPage(index)
                                    }}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentPage ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
                                        }`}
                                    aria-label={`Go to page ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between w-full mb-4">
                            <Button
                                variant="outline"
                                className="bg-white text-gray-700 hover:bg-gray-100"
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                            </Button>
                            <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleNextPage}>
                                {currentPage === totalPages - 1 ? "Continue" : "Next"} <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 w-full">
                            <Button
                                variant="outline"
                                className="bg-white text-gray-700 hover:bg-gray-100 w-full"
                                onClick={onDoNotShowAgain}
                            >
                                Do not show again
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}