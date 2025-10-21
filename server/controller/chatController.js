import { Message } from "../models/message.js"

// Function to save a new message
const saveMessage = async (messageData) => {
  try {
    const newMessage = new Message(messageData)
    await newMessage.save()
    return newMessage
  } catch (error) {
    console.error("Error saving message:", error)
    throw new Error("Failed to save message")
  }
}

// Function to get private messages between two users
const getPrivateMessages = async (userId1, userId2) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: userId1, receiver_id: userId2 },
        { sender_id: userId2, receiver_id: userId1 },
      ],
    }).sort({ timestamp: 1 }) // Sort by timestamp to get messages in order
    return messages
  } catch (error) {
    console.error("Error fetching private messages:", error)
    throw new Error("Failed to fetch private messages")
  }
}

// Function to mark a message as deleted (unsend)
const deleteMessage = async (messageId, senderId) => {
  try {
    // Find the message and ensure the sender is the one trying to delete it
    const message = await Message.findOneAndUpdate(
      { id: messageId, sender_id: senderId }, // Use 'id' field for the message ID
      { $set: { deleted: true, text: "[Message unsent]", attachmentUrls: [] } }, // Mark as deleted and clear content
      { new: true }, // Return the updated document
    )

    if (!message) {
      throw new Error("Message not found or you are not the sender.")
    }
    return message
  } catch (error) {
    console.error("Error deleting message:", error)
    throw new Error("Failed to delete message")
  }
}

// NEW: Function to update message status
const updateMessageStatus = async (messageId, newStatus) => {
  try {
    const updatedMessage = await Message.findOneAndUpdate(
      { id: messageId },
      { $set: { status: newStatus } },
      { new: true },
    )
    return updatedMessage
  } catch (error) {
    console.error(`Error updating message status for ${messageId} to ${newStatus}:`, error)
    throw new Error("Failed to update message status")
  }
}

// NEW: Function to mark multiple messages as read
const markMessagesAsRead = async (senderId, receiverId) => {
  try {
    // Update messages where receiver is the current user and sender is the other user,
    // and status is not already 'read'
    const result = await Message.updateMany(
      {
        sender_id: senderId,
        receiver_id: receiverId,
        status: { $ne: "read" }, // Only update if not already read
        deleted: false, // Only mark as read if not unsent
      },
      { $set: { status: "read" } },
    )
    return result.modifiedCount
  } catch (error) {
    console.error(`Error marking messages from ${senderId} to ${receiverId} as read:`, error)
    throw new Error("Failed to mark messages as read")
  }
}

export { saveMessage, getPrivateMessages, deleteMessage, updateMessageStatus, markMessagesAsRead }