import { Notification } from "../models/notification.js"

export const createNotification = async (
  userId,
  type,
  message,
  io,
  relatedEntityId = null,
  relatedEntityType = null,
) => {
  try {
    const newNotification = new Notification({
      userId,
      type,
      message,
      read: false, 
      relatedEntityId,
      relatedEntityType,
    })
    await newNotification.save()

    // Emit the new notification to the specific user via Socket.IO
    if (io) {
      io.to(userId.toString()).emit("notification", newNotification)
      console.log(`Emitted notification to user ${userId}:`, newNotification.message)
    }

    return newNotification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw new Error("Failed to create notification")
  }
}

export const getNotificationsByUserId = async (req, res) => {
  try {
    const userId = req.userId // From authenticateToken middleware
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications by user ID:", error)
    res.status(500).json({ message: "Server error fetching notifications." })
  }
}

// Mark a single notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params
    const userId = req.userId // From authenticateToken middleware

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: userId },
      { read: true },
      { new: true },
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found or not authorized." })
    }
    res.status(200).json({ message: "Notification marked as read.", notification })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Server error marking notification as read." })
  }
}

// Mark all notifications for a user as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.userId // From authenticateToken middleware

    await Notification.updateMany({ userId: userId, read: false }, { read: true })
    res.status(200).json({ message: "All notifications marked as read." })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ message: "Server error marking all notifications as read." })
  }
}

// Clear all notifications for a user
export const clearAllUserNotifications = async (req, res) => {
  try {
    const userId = req.userId // From authenticateToken middleware

    await Notification.deleteMany({ userId: userId })
    res.status(200).json({ message: "All notifications cleared." })
  } catch (error) {
    console.error("Error clearing all notifications:", error)
    res.status(500).json({ message: "Server error clearing all notifications." })
  }
}