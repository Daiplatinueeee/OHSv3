import mongoose from "mongoose"

const AdvertiseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["standard"],
    },
    description: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    expiration: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
)

const Advertise = mongoose.model("Advertise", AdvertiseSchema)

export { Advertise }