import mongoose from "mongoose"

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tier: {
      type: String,
      enum: ["free", "mid", "premium", "unlimited"],
      default: "free",
    },
    maxServices: {
      type: Number,
      default: 3,
    },
    name: {
      type: String,
      default: "Free Plan",
    },
    color: {
      type: String,
      default: "text-gray-600",
    },
    price: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["Monthly", "Yearly"],
      default: "Monthly",
    },
    nextBillingDate: {
      type: String,
      default: "Free Plan",
    },
  },
  { timestamps: true },
)

const Subscription = mongoose.model("Subscription", SubscriptionSchema)

export { Subscription }