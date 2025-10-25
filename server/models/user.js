import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    // Common fields for both customer and coo
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    accountType: {
      type: String,
      enum: ["customer", "coo", "provider", "admin"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended", "declined", "on review"],
      default: "pending",
    },
    suspensionDuration: {
      type: Number,
      default: null,
    },
    suspensionStartDate: {
      type: String,
      default: null,
    },
    suspensionEndDate: {
      type: String,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
    },
    coverPhoto: {
      type: String,
    },
    secretQuestion: {
      type: String,
    },
    secretAnswer: {
      type: String,
    },
    secretCode: {
      type: String,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },

    // Customer-specific fields
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    idDocuments: {
      front: { type: String },
      back: { type: String },
    },
    location: {
      type: new mongoose.Schema({
        name: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        distance: { type: Number },
        zipCode: { type: String },
      }),
    },

    // coo-specific fields
    businessName: {
      type: String,
      trim: true,
    },
    foundedDate: {
      type: Date,
    },
    teamSize: {
      type: String,
    },
    companyNumber: {
      type: String,
      trim: true,
    },
    tinNumber: {
      type: String,
      trim: true,
      match: [/^\d{3}-\d{3}-\d{3}$/, "TIN number must be in XXX-XXX-XXX format"],
    },
    cityCoverage: {
      type: [String],
    },
    aboutCompany: {
      type: String,
      trim: true,
      maxlength: [1000, "About company cannot be more than 1000 characters"],
    },
    messengerLink: {
      type: String,
      trim: true,
      default: "",
    },
    secRegistration: { type: String },
    businessPermit: { type: String },
    birRegistration: { type: String },
    eccCertificate: { type: String },
    generalLiability: { type: String },
    workersComp: { type: String },
    professionalIndemnity: { type: String },
    propertyDamage: { type: String },
    businessInterruption: { type: String },
    bondingInsurance: { type: String },

    cooId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalRatingPoints: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
          required: true,
        },
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        customerName: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        review: {
          type: String,
          trim: true,
          maxlength: [500, "Review cannot be more than 500 characters"],
        },
        serviceType: {
          type: String,
          required: true,
        },
        reviewDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
)

// Virtual property for username
userSchema.virtual("username").get(function () {
  let fullName = this.firstName || ""

  if (this.middleName) {
    fullName += ` ${this.middleName}`
  }
  if (this.lastName) {
    fullName += ` ${this.lastName}`
  }
  return fullName.trim()
})

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
  if (this.isModified("secretAnswer") && this.secretAnswer && this.secretAnswer !== "not provided") {
    const salt = await bcrypt.genSalt(10)
    this.secretAnswer = await bcrypt.hash(this.secretAnswer, salt)
  }
  if (this.isModified("secretCode") && this.secretCode && this.secretCode !== "not provided") {
    const salt = await bcrypt.genSalt(10)
    this.secretCode = await bcrypt.hash(this.secretCode, salt)
  }
  next()
})

const User = mongoose.model("User", userSchema)

export { User }
