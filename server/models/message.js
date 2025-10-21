import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    text: {
      type: String,
      required: false, // FIX: Make text optional, as messages can now be just attachments
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: String, // Store sender's username for display
      required: true,
    },
    room: {
      type: String, // e.g., "private"
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    attachmentUrls: {
      // NEW: Field to store URLs of attached files
      type: [String], // Array of strings
      default: [], // Default to an empty array
    },
    status: {
      // NEW: Message status (e.g., 'sent', 'delivered', 'read')
      type: String,
      enum: ["sent", "delivered", "read"], // Define possible statuses
      default: "sent", // Default status when message is first sent
    },
    deleted: {
      // NEW: Flag to mark message as deleted/unsent
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }, // Adds createdAt and updatedAt fields automatically
)

const Message = mongoose.model("Message", messageSchema)

export { Message }