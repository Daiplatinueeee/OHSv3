import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Home,
  User,
  CreditCard,
  Projector,
  MessageCircleMore,
  PowerOff,
  Bell,
  CircleUserRound,
  Newspaper,
  ChevronUp,
  Coffee,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import NotificationPopup, { type NotificationItem } from "../Customer_Tabs/Notification"

interface DockItemProps {
  icon: React.ReactNode
  label: string
  to: string
  isActive: boolean
  onClick?: () => void
  badge?: number
}

const DockItem: React.FC<DockItemProps> = ({ icon, label, to, isActive, onClick, badge }) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to === "/login") {
      localStorage.removeItem("token")
      navigate(to)
    } else {
      navigate(to)
    }
  }

  return (
    <div
      className={`relative flex items-center justify-center w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out ${isHovered ? "scale-110" : "scale-100"
        }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center justify-center transition-all duration-200 ${isActive ? "text-white" : isHovered ? "text-white" : "text-gray-400"
          }`}
      >
        {label === "Notifications" ? (
          <motion.div
            animate={
              badge !== undefined && badge > 0
                ? {
                  scale: [1, 1.1, 1, 1.1, 1],
                  rotate: [0, -5, 5, -5, 5, 0],
                }
                : {}
            }
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: badge !== undefined && badge > 0 ? Number.POSITIVE_INFINITY : 0,
              repeatDelay: 2,
            }}
            className="relative"
          >
            {icon}
            {badge !== undefined && badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full ring-1 ring-white"
                style={{ transform: "translate(30%, -30%)" }}
              />
            )}
          </motion.div>
        ) : (
          icon
        )}
      </div>

      {/* Label with animation */}
      <div
        className={`absolute -top-8 bg-sky-400 text-white text-xs px-2 py-1 rounded-md opacity-0 transition-all duration-200 ${isHovered ? "opacity-100 transform translate-y-0" : "transform translate-y-2"
          }`}
      >
        {label}
      </div>
    </div>
  )
}

const FloatingDock: React.FC = () => {
  const location = useLocation()
  const [showDock, setShowDock] = useState(true)
  const [showNotificationPopup, setShowNotificationPopup] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasShownNotification, setHasShownNotification] = useState(false)

  const handleNotificationClick = () => {
    setShowNotificationPopup(!showNotificationPopup)
    if (!showNotificationPopup) {
      setHasShownNotification(false)
    }
  }

  const updateNotificationBadge = (notifications: NotificationItem[]) => {
    const unreadCount = notifications.filter((n) => n.status === "unread").length
    setUnreadNotifications(unreadCount)
  }

  const getActiveBookingsWithProviderAcceptdCount = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:3000/api/bookings/active-with-provider-accepted", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const bookings = await response.json()
        const activeCount = bookings.length

        if (activeCount === 0) {
          setHasShownNotification(false)
          setUnreadNotifications(0)
        }
        else if (!hasShownNotification) {
          setUnreadNotifications(activeCount)
          setHasShownNotification(true)
        }
        else {
          setUnreadNotifications(activeCount)
        }

        console.log(`Active bookings with provider accepted count: ${activeCount}`)
      }
    } catch (error) {
      console.error("Error fetching active bookings with provider accepted:", error)
    }
  }

  useEffect(() => {
    const storedUserId = localStorage.getItem("user") || sessionStorage.getItem("user")

    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserId(user._id || user.id || storedUserId)
      } catch (error) {
        console.error("Error parsing user data:", error)
        setUserId(storedUserId)
      }
    } else {
      setUserId(storedUserId)
    }

    getActiveBookingsWithProviderAcceptdCount()
  }, [])

  useEffect(() => {
    if (!hasShownNotification) {
      const interval = setInterval(() => {
        getActiveBookingsWithProviderAcceptdCount()

        setTimeout(() => {
          if (typeof window !== "undefined" && window.performance) {
            if (window.performance.clearResourceTimings) {
              window.performance.clearResourceTimings()
            }
          }
        }, 100)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [hasShownNotification])

  return (
    <AnimatePresence>
      {/* Toggle Button - Only visible when dock is hidden */}
      {!showDock && (
        <motion.button
          onClick={() => setShowDock(true)}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border text-gray-500 rounded-full p-3 shadow-md hover:bg-gray-100 cursor-pointer transition-all duration-200 z-50"
          aria-label="Show dock"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 3,
            }}
          >
            <Coffee className="w-5 h-5" />
          </motion.div>
        </motion.button>
      )}

      {/* Floating Dock */}
      {showDock && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-200/40 backdrop-blur-lg rounded-full shadow-lg px-2 py-1 flex items-center transition-all duration-200 hover:shadow-xl z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <DockItem
            icon={<Home size={20} strokeWidth={1.5} color="gray" />}
            label="Home"
            to="/admin"
            isActive={location.pathname === "/"}
          />
          <DockItem
            icon={<User size={20} strokeWidth={1.5} color="gray" />}
            label="Accounts"
            to="/admin/accounts"
            isActive={location.pathname === "/admin/accounts"}
          />
          <DockItem
            icon={<CreditCard size={20} strokeWidth={1.5} color="gray" />}
            label="Payments"
            to="/admin/transactions"
            isActive={location.pathname === "/menu"}
          />
          <DockItem
            icon={<CreditCard size={20} strokeWidth={1.5} color="gray" />}
            label="Reports"
            to="/admin/reports"
            isActive={location.pathname === "/menu"}
          />
          <DockItem
            icon={<Projector size={20} strokeWidth={1.5} color="gray" />}
            label="Activities"
            to="/admin/activities"
            isActive={location.pathname === "/admin/activities"}
          />
          <DockItem
            icon={<MessageCircleMore size={20} strokeWidth={1.5} color="gray" />}
            label="Chats"
            to="/chat"
            isActive={location.pathname === "/chat"}
          />
          <div className="relative">
            <DockItem
              icon={<Bell size={20} strokeWidth={1.5} color="gray" />}
              label="Notifications"
              to="/admin/notifications"
              isActive={showNotificationPopup}
              onClick={handleNotificationClick}
              badge={unreadNotifications}
            />

            <AnimatePresence>
              {showNotificationPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 md:w-96 shadow-xl z-50"
                  style={{
                    transformOrigin: "bottom right",
                    filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <NotificationPopup
                    onClose={() => setShowNotificationPopup(false)}
                    updateBadge={updateNotificationBadge}
                    userId={userId || undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DockItem
            icon={<CircleUserRound size={20} strokeWidth={1.5} color="gray" />}
            label="Profile"
            to="/admin/my-account"
            isActive={location.pathname === "/"}
          />
          <DockItem
            icon={<Newspaper size={20} strokeWidth={1.5} color="gray" />}
            label="News"
            to="/admin/news"
            isActive={location.pathname === "/admin/news"}
          />
          <DockItem
            icon={<PowerOff size={20} strokeWidth={1.5} color="gray" />}
            label="Logout"
            to="/login"
            isActive={location.pathname === "/"}
          />

          {/* Hide Dock Button as a dock item */}
          <div
            className="relative flex items-center justify-center w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out hover:scale-110"
            onClick={() => setShowDock(false)}
            onMouseEnter={(e) => e.currentTarget.classList.add("scale-110")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("scale-110")}
          >
            <div className="flex items-center justify-center transition-all duration-200 text-gray-400 hover:text-white">
              <ChevronUp size={20} strokeWidth={1.5} color="gray" />
            </div>
            <div className="absolute -top-8 bg-sky-400 text-white text-xs px-2 py-1 rounded-md opacity-0 transition-all duration-200 hover:opacity-100 hover:transform hover:translate-y-0 transform translate-y-2">
              Hide
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FloatingDock