import mongoose from "mongoose"

const ReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    reporterProfilePicture: {
      type: String,
      default: null,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerEmail: {
      type: String,
    },
    sellerProfilePicture: {
      type: String,
      default: null,
    },
    reportReason: {
      type: String,
      enum: [
        "spam",
        "inappropriate",
        "scam",
        "harassment",
        "fake",
        "quality",
        "pricing",
        "payment_not_received",
        "other",
      ],
      required: true,
    },
    reportDetails: {
      type: String,
      required: true,
    },
    proofImages: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const Report = mongoose.model("Report", ReportSchema)

export { Report }
