import mongoose from "mongoose"

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "booking", "payment", "system"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
    },
    link: {
      type: String,
      default: null,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedEntityType: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
)

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema)

export default Notification
export { Notification }