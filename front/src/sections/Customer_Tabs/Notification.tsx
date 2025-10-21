"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  X,
  Check,
  Calendar,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  ExternalLink,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface NotificationItem {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "booking" | "payment" | "system"
  status: "read" | "unread"
  createdAt: string
  icon?: string
  link?: string
}

interface NotificationProps {
  userId?: string
  onClose?: () => void
  updateBadge?: (notifications: NotificationItem[]) => void
}

const NotificationPopup: React.FC<NotificationProps> = ({ userId, onClose, updateBadge }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewAll, setViewAll] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [expandedNotifications, setExpandedNotifications] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    } else {
      setError("User not authenticated. Please log in to view notifications.")
    }
  }, [userId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        if (onClose) onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    if (updateBadge) {
      updateBadge(notifications)
    }
  }, [notifications, updateBadge])

  useEffect(() => {
    setIsExpanded(true)
  }, [])

  const fetchNotifications = async () => {
    if (!userId) {
      setError("User ID is required to fetch notifications")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`http://localhost:3000/api/notifications/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError("Failed to load notifications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!userId) {
      console.error("User ID is required to mark notification as read")
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, status: "read" } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) {
      console.error("User ID is required to mark all notifications as read")
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${userId}/read-all`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          status: "read",
        })),
      )
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const clearAllNotifications = async () => {
    if (!userId) {
      console.error("User ID is required to clear notifications")
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to clear notifications")
      }

      setNotifications([])
    } catch (error) {
      console.error("Error clearing all notifications:", error)
      setNotifications([])
    }
  }

  const getIcon = (notification: NotificationItem) => {
    if (notification.icon) {
      switch (notification.icon) {
        case "calendar":
        case "calendar-clock":
        case "calendar-check":
        case "calendar-x":
          return <Calendar className="h-5 w-5" />
        case "credit-card":
          return <CreditCard className="h-5 w-5" />
        case "alert-triangle":
          return <AlertTriangle className="h-5 w-5" />
        case "info":
          return <Info className="h-5 w-5" />
        case "check-circle":
          return <CheckCircle className="h-5 w-5" />
        default:
          return <Info className="h-5 w-5" />
      }
    }

    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "booking":
        return <Calendar className="h-5 w-5 text-purple-500" />
      case "payment":
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-sky-500" />
    }
  }

  const getBackgroundColor = (notification: NotificationItem) => {
    if (notification.status === "unread") {
      switch (notification.type) {
        case "success":
          return "bg-green-50"
        case "warning":
          return "bg-yellow-50"
        case "error":
          return "bg-red-50"
        case "booking":
          return "bg-purple-50"
        case "payment":
          return "bg-blue-50"
        case "info":
        default:
          return "bg-sky-50"
      }
    }
    return "bg-white"
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
    }

    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.status === "unread") {
      markAsRead(notification._id)
    }

    setExpandedNotifications((prev) =>
      prev.includes(notification._id) ? prev.filter((id) => id !== notification._id) : [...prev, notification._id],
    )
  }

  const toggleViewAll = () => {
    setViewAll(!viewAll)
  }

  const unreadCount = notifications.filter((notification) => notification.status === "unread").length

  const displayedNotifications = viewAll ? notifications : notifications.slice(0, 3)

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className="relative w-full"
          ref={notificationRef}
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-sky-600 hover:text-sky-800 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </button>
                {onClose && (
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className={`${viewAll ? "overflow-y-auto max-h-[400px]" : "overflow-hidden"}`}>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">{error}</p>
                  {userId && (
                    <button onClick={fetchNotifications} className="mt-2 text-xs text-sky-600 hover:text-sky-800">
                      Try again
                    </button>
                  )}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No notifications yet</p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  {displayedNotifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.3 }}
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${getBackgroundColor(
                        notification,
                      )}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex">
                        <div className="flex-shrink-0 mr-3">{getIcon(notification)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 break-words">{notification.title}</p>
                          <p className="text-sm text-gray-600 break-words line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                        </div>
                        {notification.status === "unread" && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-block w-2 h-2 bg-sky-500 rounded-full"></span>
                          </div>
                        )}
                      </div>

                      {expandedNotifications.includes(notification._id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-gray-100"
                        >
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {notification.message}
                            </p>
                            {notification.link && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(notification.link, "_blank")
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                See Details
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
              {notifications.length > 3 && (
                <button
                  onClick={toggleViewAll}
                  className="text-sm text-sky-600 hover:text-sky-800 flex items-center justify-center w-full"
                >
                  {viewAll ? "Show less" : "View all notifications"}
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transition-transform duration-300 ${viewAll ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationPopup