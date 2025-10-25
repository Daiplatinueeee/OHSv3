import mongoose from "mongoose"

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    serviceImage: {
      type: String,
    },
    providerName: {
      type: String,
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    workerCount: {
      type: Number,
      default: 1,
    },
    bookingDate: {
      type: String,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    location: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      distance: { type: Number, required: true },
    },
    estimatedTime: {
      type: String,
    },
    pricing: {
      baseRate: { type: Number, required: true },
      distanceCharge: { type: Number, required: true },
      totalRate: { type: Number, required: true },
    },
    specialRequests: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "active", "ongoing", "cancelled", "completed", "declined"],
      default: "pending",
    },

    declineReason: {
      type: String,
      trim: true,
      maxlength: [200, "Decline reason cannot exceed 200 characters"],
      default: "",
    },
    autoCancelDate: {
      type: Date,
      required: false,
    },
    providerAccepted: {
      type: Boolean,
      default: false,
    },
    providerConfirmation: {
      type: Boolean,
      default: false,
    },
    customerConfirmation: {
      type: Boolean,
      default: false,
    },
    serviceComplete: {
      type: Boolean,
      default: false,
    },
    destinationArrived: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["credit", "wallet", "bank", "paymongo"],
      default: null,
    },
    paymentComplete: {
      type: Boolean,
      default: false,
    },
    assignedWorkers: [
      {
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        assignedAt: { type: Date, default: Date.now },
      },
    ],
    workersFilled: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      trim: true,
      maxlength: [500, "Review cannot be more than 500 characters"],
      default: null,
    },
    reviewDate: {
      type: Date,
      default: null,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    providerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    providerReview: {
      type: String,
      trim: true,
      maxlength: [500, "Review cannot be more than 500 characters"],
      default: null,
    },
    providerReviewDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

BookingSchema.virtual("confirmation").get(function () {
  return this.providerConfirmation && this.customerConfirmation
})

BookingSchema.set("toJSON", { virtuals: true })
BookingSchema.set("toObject", { virtuals: true })

const Booking = mongoose.model("Booking", BookingSchema)

export { Booking }