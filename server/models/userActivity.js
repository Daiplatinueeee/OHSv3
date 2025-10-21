import mongoose from "mongoose"

const UserActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["login", "logout", "update", "create", "delete", "booking", "payment", "system"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
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

const UserActivity =
  mongoose.models.UserActivity || mongoose.model("UserActivity", UserActivitySchema)

export default UserActivity
export { UserActivity }
