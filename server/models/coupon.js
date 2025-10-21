import mongoose from "mongoose"

const CouponSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // For percentage discounts, cap the maximum discount amount
    },
    minPurchase: {
      type: Number,
      default: 0, // Minimum booking amount to use this coupon
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    couponType: {
      type: String,
      enum: ["first_booking", "promotional", "compensation", "referral"],
      default: "first_booking",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

// Compound index for efficient queries
CouponSchema.index({ userId: 1, companyId: 1 })
CouponSchema.index({ code: 1, isUsed: 1 })
CouponSchema.index({ expiresAt: 1 })

// Virtual to check if coupon is expired
CouponSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt
})

// Virtual to check if coupon is valid
CouponSchema.virtual("isValid").get(function () {
  return !this.isUsed && !this.isExpired
})

CouponSchema.set("toJSON", { virtuals: true })
CouponSchema.set("toObject", { virtuals: true })

const Coupon = mongoose.model("Coupon", CouponSchema)

export { Coupon }