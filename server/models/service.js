import mongoose from "mongoose"

const ServiceSchema = new mongoose.Schema(
  {
    cooId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "/placeholder.svg?height=48&width=48",
    },
    chargePerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    mainCategory: {
      type: String,
      required: false,
    },
    subCategory: {
      type: String,
      required: false,
    },
    totalRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    workersNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    estimatedTime: {
      type: String,
      default: "1 day or more",
    },
  },
  { timestamps: true },
)

const Service = mongoose.model("Service", ServiceSchema)

export { Service }
