import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cooId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming COO is also a User
      required: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    providerNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Suspended"],
      default: "Pending",
    },
    avatar: {
      type: String,
      default: "/placeholder.svg?height=40&width=40",
    },
    dateRegistered: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", ProviderSchema);

export { Provider };