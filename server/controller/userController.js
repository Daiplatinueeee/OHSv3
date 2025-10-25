import { User } from "../models/user.js"
import Notification from "../models/notification.js"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import UserActivity from "../models/userActivity.js"
import { Booking } from "../models/bookings.js"
import { Service } from "../models/service.js"

// Helper function for password validation
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long."
  }
  return null
}

const getOptionalValue = (value) => {
  return value === null || value === undefined || value === "" ? "not provided" : value
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services or SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.APP_PASSWORD, // Your generated App Password
  },
})

console.log(process.env.EMAIL_USER)
console.log(process.env.APP_PASSWORD)

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email (for existing users, e.g., login/password reset)
export const sendOtpEmail = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "Email is required." })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "Email not registered. Please create an account first." })
    }

    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // OTP valid for 10 minutes

    user.otp = otp
    user.otpExpires = otpExpires
    await user.save()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your HandyGo Magic Link / OTP",
      html: `
    <h2>Your One-Time Password (OTP)</h2>
    <p>Please use the following code to complete your login/verification:</p>
    <h1 style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</h1>
    <p>This code is valid for 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `,
    }

    await transporter.sendMail(mailOptions)
    res.status(200).json({ message: "OTP sent to your email." })
  } catch (error) {
    console.error("Error sending OTP email:", error)
    res.status(500).json({ message: "Failed to send OTP. Please try again." })
  }
}

// Verify OTP (for existing users, e.g., login/password reset)
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." })
    }

    // OTP is valid, clear it and mark user as verified if not already
    user.otp = null
    user.otpExpires = null
    user.isVerified = true // Mark as verified upon successful OTP login
    user.status = "active" // Set status to active for magic link users
    await user.save()

    // Generate JWT for OTP verified user
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined in environment variables.")
      return res.status(500).json({ message: "Server configuration error: JWT secret missing." })
    }
    const token = jwt.sign({ userId: user._id, email: user.email, accountType: user.accountType }, jwtSecret, {
      expiresIn: "1h",
    })

    // If login is successful, return user data (excluding password) and the token
    const { password: _, ...userData } = user.toObject()
    res.status(200).json({ message: "OTP verified successfully! Login successful.", user: userData, token: token })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    res.status(500).json({ message: "Server error during OTP verification." })
  }
}

// NEW: Send email verification code (for any email, including new ones)
export const sendEmailVerificationCode = async (req, res, emailVerificationCodes) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "Email is required." })
  }

  try {
    const code = generateOTP() // Reuse OTP generation logic
    const expiresAt = Date.now() + 10 * 60 * 1000 // Code valid for 10 minutes

    emailVerificationCodes.set(email, { code, expiresAt }) // Store code in the map

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Email Verification Code",
      html: `
        <h2>Verify Your Email Address</h2>
        <p>Please use the following code to verify your email address:</p>
        <h1 style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    res.status(200).json({ message: "Verification code sent to your email." })
  } catch (error) {
    console.error("Error sending email verification code:", error)
    res.status(500).json({ message: "Failed to send verification code. Please try again." })
  }
}

// NEW: Verify email verification code
export const verifyEmailVerificationCode = async (req, res, emailVerificationCodes) => {
  const { email, code } = req.body
  const userId = req.userId // Get current user ID from authenticated token

  if (!email || !code || !userId) {
    return res.status(400).json({ message: "Email, code, and user ID are required." })
  }

  try {
    const stored = emailVerificationCodes.get(email)

    if (!stored || stored.code !== code || stored.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired verification code." })
    }

    // Code is valid, remove it from temporary storage
    emailVerificationCodes.delete(email)

    // Update the user's email in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email: email },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found for email update." })
    }

    res.status(200).json({ message: "Email verified and updated successfully!", user: updatedUser })
  } catch (error) {
    console.error("Error verifying email verification code:", error)
    res.status(500).json({ message: "Server error during email verification." })
  }
}

// Unified account registration function for admin use
export const registerAccount = async (req, res) => {
  try {
    const {
      email,
      password,
      accountType,
      firstName,
      lastName,
      mobileNumber,
      gender,
      location,
      minimalMode,
      middleName,
      bio,
      secretQuestion,
      secretAnswer,
      secretCode,
      profilePicture,
      coverPhoto,
      idDocuments,
      // COO-specific fields
      businessName,
      foundedDate,
      teamSize,
      companyNumber,
      tinNumber,
      cityCoverage,
      aboutCompany,
      secRegistration,
      businessPermit,
      birRegistration,
      eccCertificate,
      generalLiability,
      workersComp,
      professionalIndemnity,
      propertyDamage,
      businessInterruption,
      bondingInsurance,
    } = req.body

    // Validate account type
    if (!accountType || !["customer", "coo", "provider", "admin"].includes(accountType)) {
      return res.status(400).json({ message: "Valid account type is required (customer, coo, provider, admin)." })
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      if (password) {
        return res.status(400).json({ message: passwordError })
      }
    }

    // Check if user already exists (only if email is provided and not empty)
    if (email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists." })
      }
    }

    // Base user data common to all account types
    const userData = {
      email: email || null,
      password: password || null,
      accountType,
      firstName: getOptionalValue(firstName),
      lastName: getOptionalValue(lastName),
      mobileNumber: getOptionalValue(mobileNumber),
      gender: getOptionalValue(gender),
      secretQuestion: getOptionalValue(secretQuestion),
      secretAnswer: getOptionalValue(secretAnswer),
      secretCode: getOptionalValue(secretCode),
      location: location
        ? {
          name: getOptionalValue(location.name),
          lat: getOptionalValue(location.lat),
          lng: getOptionalValue(location.lng),
          distance: getOptionalValue(location.distance),
          zipCode: getOptionalValue(location.zipCode),
        }
        : null,
      middleName: getOptionalValue(middleName),
      bio: getOptionalValue(bio),
      profilePicture: getOptionalValue(profilePicture),
      coverPhoto: getOptionalValue(coverPhoto),
      idDocuments: idDocuments
        ? {
          front: getOptionalValue(idDocuments.front),
          back: getOptionalValue(idDocuments.back),
        }
        : null,
      status: minimalMode ? "pending" : "pending",
      isVerified: minimalMode ? true : false,
    }

    // Add COO-specific fields if account type is COO
    if (accountType === "coo") {
      Object.assign(userData, {
        businessName: getOptionalValue(businessName),
        foundedDate: getOptionalValue(foundedDate),
        teamSize: getOptionalValue(teamSize),
        companyNumber: getOptionalValue(companyNumber),
        tinNumber: getOptionalValue(tinNumber),
        cityCoverage: cityCoverage || [],
        aboutCompany: getOptionalValue(aboutCompany),
        secRegistration: getOptionalValue(secRegistration),
        businessPermit: getOptionalValue(businessPermit),
        birRegistration: getOptionalValue(birRegistration),
        eccCertificate: getOptionalValue(eccCertificate),
        generalLiability: getOptionalValue(generalLiability),
        workersComp: getOptionalValue(workersComp),
        professionalIndemnity: getOptionalValue(professionalIndemnity),
        propertyDamage: getOptionalValue(propertyDamage),
        businessInterruption: getOptionalValue(businessInterruption),
        bondingInsurance: getOptionalValue(bondingInsurance),
      })
    }

    const newUser = new User(userData)
    await newUser.save()

    let isVerified = false
    let message = ""
    let title = ""
    let type = ""
    let link = ""

    if (accountType === "customer") {
      // Check if customer has both ID documents
      const hasValidIdDocs =
        userData.idDocuments &&
        userData.idDocuments.front &&
        userData.idDocuments.front !== "not provided" &&
        userData.idDocuments.back &&
        userData.idDocuments.back !== "not provided"

      isVerified = hasValidIdDocs
      message = isVerified
        ? "Welcome! Your account has been verified and is ready to use."
        : "Welcome! Please upload your ID documents to verify your account."
      title = isVerified ? "Account Verified!" : "Welcome! Please Verify Your Account"
      type = isVerified ? "success" : "warning"
      link = isVerified ? null : "/profile/verification"
    } else if (accountType === "coo") {
      const requiredDocs = [
        userData.secRegistration,
        userData.businessPermit,
        userData.birRegistration,
        userData.eccCertificate,
        userData.generalLiability,
        userData.workersComp,
        userData.professionalIndemnity,
        userData.propertyDamage,
        userData.businessInterruption,
        userData.bondingInsurance,
      ]

      const hasAllDocs = requiredDocs.every((doc) => doc && doc !== "not provided")

      isVerified = hasAllDocs
      message = isVerified
        ? "Welcome! Your business account has been verified and is ready to use."
        : "Welcome! Please complete your business documentation to verify your account."
      title = isVerified ? "Business Account Verified!" : "Business Account Created - Documentation Required"
      type = isVerified ? "success" : "warning"
      link = isVerified ? null : "/profile/business-verification"
    } else {
      isVerified = true
      message = "Welcome! Your account has been created successfully."
      title = "Account Verified!"
      type = "success"
      link = null
    }

    const notification = new Notification({
      userId: newUser._id,
      title: title,
      type: type,
      message: message,
      status: "unread",
      link: link,
    })

    await notification.save()

    res.status(201).json({
      message: `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} account created successfully!`,
      user: newUser,
    })
  } catch (error) {
    console.error("Account registration error:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error during account registration." })
  }
}

// Register Customer
export const registerCustomer = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      mobileNumber,
      gender,
      location,
      minimalMode,
      middleName,
      bio,
      secretQuestion,
      secretAnswer,
      secretCode,
      profilePicture,
      coverPhoto,
      idDocuments,
    } = req.body

    const passwordError = validatePassword(password)
    if (passwordError) {
      if (password) {
        return res.status(400).json({ message: passwordError })
      }
    }

    // Check if user already exists (only if email is provided and not empty)
    if (email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists." })
      }
    }

    // Set default values for optional fields.
    // For email, explicitly set to null if not provided, instead of "not provided" string
    const customerData = {
      email: email || null, // FIX: Set email to null if not provided, instead of "not provided" string
      password: password || null,
      accountType: "customer",
      firstName: getOptionalValue(firstName),
      lastName: getOptionalValue(lastName),
      mobileNumber: getOptionalValue(mobileNumber),
      gender: getOptionalValue(gender),
      secretQuestion: getOptionalValue(secretQuestion),
      secretAnswer: getOptionalValue(secretAnswer),
      secretCode: getOptionalValue(secretCode),
      location: location
        ? {
          name: getOptionalValue(location.name),
          lat: getOptionalValue(location.lat),
          lng: getOptionalValue(location.lng),
          distance: getOptionalValue(location.distance),
          zipCode: getOptionalValue(location.zipCode),
        }
        : null,
      middleName: getOptionalValue(middleName),
      bio: getOptionalValue(bio),
      profilePicture: getOptionalValue(profilePicture),
      coverPhoto: getOptionalValue(coverPhoto),
      idDocuments: idDocuments
        ? {
          front: getOptionalValue(idDocuments.front),
          back: getOptionalValue(idDocuments.back),
        }
        : null,
      status: minimalMode ? "pending" : "pending",
      isVerified: minimalMode ? true : false,
    }

    const newUser = new User(customerData)
    await newUser.save()

    // Check if customer has both ID documents
    const hasValidIdDocs =
      customerData.idDocuments &&
      customerData.idDocuments.front &&
      customerData.idDocuments.front !== "not provided" &&
      customerData.idDocuments.back &&
      customerData.idDocuments.back !== "not provided"

    const isVerified = hasValidIdDocs
    const message = isVerified
      ? "Welcome! Your account has been verified and is ready to use."
      : "Welcome! Please upload your ID documents to verify your account."
    const title = isVerified ? "Account Verified!" : "Welcome! Please Verify Your Account"
    const type = isVerified ? "success" : "warning"
    const link = isVerified ? null : "/profile/verification"

    // Create the notification
    const notification = new Notification({
      userId: newUser._id,
      title: title,
      type: type,
      message: message,
      status: "unread",
      link: link,
    })

    await notification.save()

    res.status(201).json({ message: "Customer registered successfully!", user: newUser })
  } catch (error) {
    console.error("Customer registration error:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error during customer registration." })
  }
}

// Register COO
export const registerCOO = async (req, res) => {
  try {
    const {
      email,
      password,
      businessName,
      foundedDate,
      teamSize,
      companyNumber,
      tinNumber,
      cityCoverage,
      location,
      minimalMode,
      secretQuestion,
      secretAnswer,
      secretCode,
      aboutCompany,
      profilePicture,
      coverPhoto,
      secRegistration,
      businessPermit,
      birRegistration,
      eccCertificate,
      generalLiability,
      workersComp,
      professionalIndemnity,
      propertyDamage,
      businessInterruption,
      bondingInsurance,
    } = req.body

    const passwordError = validatePassword(password)
    if (passwordError) {
      if (password) {
        return res.status(400).json({ message: passwordError })
      }
    }

    // Check if user already exists (only if email is provided and not empty)
    if (email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists." })
      }
    }

    // Set default values for optional fields.
    // For email, explicitly set to null if not provided, instead of "not provided" string.
    const COOData = {
      email: email || null, // FIX: Set email to null if not provided, instead of "not provided" string
      password: password || null,
      accountType: "coo",
      businessName: getOptionalValue(businessName),
      foundedDate: getOptionalValue(foundedDate),
      teamSize: getOptionalValue(teamSize),
      companyNumber: getOptionalValue(companyNumber),
      tinNumber: getOptionalValue(tinNumber),
      cityCoverage: cityCoverage || [],
      secretQuestion: getOptionalValue(secretQuestion),
      secretAnswer: getOptionalValue(secretAnswer),
      secretCode: getOptionalValue(secretCode),
      location: location
        ? {
          name: getOptionalValue(location.name),
          lat: getOptionalValue(location.lat),
          lng: getOptionalValue(location.lng),
          distance: getOptionalValue(location.distance),
          zipCode: getOptionalValue(location.zipCode),
        }
        : null,
      aboutCompany: getOptionalValue(aboutCompany),
      profilePicture: getOptionalValue(profilePicture),
      coverPhoto: getOptionalValue(coverPhoto),
      secRegistration: getOptionalValue(secRegistration),
      businessPermit: getOptionalValue(businessPermit),
      birRegistration: getOptionalValue(birRegistration),
      eccCertificate: getOptionalValue(eccCertificate),
      generalLiability: getOptionalValue(generalLiability),
      workersComp: getOptionalValue(workersComp),
      professionalIndemnity: getOptionalValue(professionalIndemnity),
      propertyDamage: getOptionalValue(propertyDamage),
      businessInterruption: getOptionalValue(businessInterruption),
      bondingInsurance: getOptionalValue(bondingInsurance),
      status: minimalMode ? "pending" : "pending",
      isVerified: minimalMode ? true : false,
    }

    const newUser = new User(COOData)
    await newUser.save()

    // Check if COO has all required business documents
    const requiredDocs = [
      COOData.secRegistration,
      COOData.businessPermit,
      COOData.birRegistration,
      COOData.eccCertificate,
      COOData.generalLiability,
      COOData.workersComp,
      COOData.professionalIndemnity,
      COOData.propertyDamage,
      COOData.businessInterruption,
      COOData.bondingInsurance,
    ]

    const hasAllDocs = requiredDocs.every((doc) => doc && doc !== "not provided")

    const isVerified = hasAllDocs
    const message = isVerified
      ? "Welcome! Your business account has been verified and is ready to use."
      : "Welcome! Please complete your business documentation to verify your account."
    const title = isVerified ? "Business Account Verified!" : "Business Account Created - Documentation Required"
    const type = isVerified ? "success" : "warning"
    const link = isVerified ? null : "/profile/business-verification"

    // Create the notification
    const notification = new Notification({
      userId: newUser._id,
      title: title,
      type: type,
      message: message,
      status: "unread",
      link: link,
    })

    await notification.save()

    res.status(201).json({ message: "COO registered successfully!", user: newUser })
  } catch (error) {
    console.error("COO registration error:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error during coo registration." })
  }
}

// New login function
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required." })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    // If password is provided, attempt password login
    if (password) {
      if (!user.password) {
        return res.status(401).json({ message: "This account does not have a password set. Please use magic link." })
      }
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        // ❌ Log failed login attempt
        await UserActivity.create({
          userId: user._id,
          action: "Login Attempt Failed",
          category: "login",
          description: `User attempted to log in but entered an incorrect password.`,
          status: "failed",
        })

        return res.status(401).json({ message: "Incorrect password." })
      }
    } else {
      return res.status(400).json({ message: "Password is required for password-based login." })
    }

    // Generate JWT for password-based login
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined in environment variables.")
      return res.status(500).json({ message: "Server configuration error: JWT secret missing." })
    }

    const token = jwt.sign({ userId: user._id, email: user.email, accountType: user.accountType }, jwtSecret, {
      expiresIn: "1h",
    })

    // ✅ Log successful login activity
    await UserActivity.create({
      userId: user._id,
      action: "User Logged In",
      category: "login",
      description: `${user.email} successfully logged in.`,
      status: "success",
      link: `/dashboard`, // optional, can be the page they land on
    })

    // Return user data (excluding password)
    const { password: _, ...userData } = user.toObject()
    res.status(200).json({ message: "Login successful!", user: userData, token: token })
  } catch (error) {
    console.error("Login error:", error)

    // ⚠️ Log server-side error
    await UserActivity.create({
      action: "Login Error",
      category: "system",
      description: `Unexpected server error during login: ${error.message}`,
      status: "failed",
    })

    res.status(500).json({ message: "Server error during login." })
  }
}

export const logoutUser = async (req, res) => {
  try {
    const userId = req.userId // must come from JWT middleware
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." })
    }

    await UserActivity.create({
      userId,
      action: "User Logged Out",
      category: "logout",
      description: "User successfully logged out of the system.",
      status: "success",
    })

    res.status(200).json({ message: "Logout successful." })
  } catch (error) {
    console.error("Logout error:", error)

    await UserActivity.create({
      action: "Logout Error",
      category: "system",
      description: `Error occurred during logout: ${error.message}`,
      status: "failed",
    })

    res.status(500).json({ message: "Server error during logout." })
  }
}

// New: Fetch secret question and availability of secret answer/code
export const fetchSecretDetails = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: "Email is required." })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }
    // Only return if they exist, not the values themselves
    const hasSecretQuestion = user.secretQuestion && user.secretQuestion !== "not provided"
    const hasSecretAnswer = user.secretAnswer && user.secretAnswer !== "not provided"
    const hasSecretCode = user.secretCode && user.secretCode !== "not provided"

    // If a secret question exists, return it. Otherwise, indicate it doesn't exist.
    const secretQuestionText = hasSecretQuestion ? user.secretQuestion : null

    res.status(200).json({
      message: "Secret details fetched successfully.",
      secretQuestion: secretQuestionText, // Send the question text if it exists
      hasSecretAnswer, // Indicate if an answer is set
      hasSecretCode, // Indicate if a code is set
    })
  } catch (error) {
    console.error("Error fetching secret details:", error)
    res.status(500).json({ message: "Server error fetching secret details." })
  }
}

// New: Verify secret answer
export const verifySecretAnswer = async (req, res) => {
  const { email, answer } = req.body
  if (!email || !answer) {
    return res.status(400).json({ message: "Email and answer are required." })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }
    if (!user.secretAnswer || user.secretAnswer === "not provided") {
      return res.status(400).json({ message: "No secret answer set for this user." })
    }
    const isMatch = await bcrypt.compare(answer, user.secretAnswer)
    if (isMatch) {
      res.status(200).json({ success: true, message: "Secret answer verified successfully." })
    } else {
      res.status(401).json({ success: false, message: "Incorrect secret answer." })
    }
  } catch (error) {
    console.error("Error verifying secret answer:", error)
    res.status(500).json({ message: "Server error during secret answer verification." })
  }
}

// New: Verify secret code
export const verifySecretCode = async (req, res) => {
  const { email, code } = req.body
  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required." })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }
    if (!user.secretCode || user.secretCode === "not provided") {
      return res.status(400).json({ message: "No secret code set for this user." })
    }
    const isMatch = await bcrypt.compare(code, user.secretCode)
    if (isMatch) {
      res.status(200).json({ success: true, message: "Secret code verified successfully." })
    } else {
      res.status(401).json({ success: false, message: "Incorrect secret code." })
    }
  } catch (error) {
    console.error("Error verifying secret code:", error)
    res.status(500).json({ message: "Server error during secret code verification." })
  }
}

// New: Reset password
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." })
  }
  const passwordError = validatePassword(newPassword)
  if (passwordError) {
    return res.status(400).json({ message: passwordError })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }
    // Assign the plain new password. The pre-save hook in the User model will hash it.
    user.password = newPassword
    await user.save()

    res.status(200).json({ success: true, message: "Password reset successfully." })
  } catch (error) {
    console.error("Error resetting password:", error)
    res.status(500).json({ message: "Server error during password reset." })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.userId // From authenticateToken middleware
    const userIdFromParams = req.params.userId // From route params

    // Validate that the authenticated user matches the user ID in the route
    if (userId !== userIdFromParams) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only change your own password.",
      })
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      })
    }

    // Validate new password
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      })
    }

    // Find the user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      })
    }

    // Verify current password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account does not have a password set.",
      })
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      })
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    })
  } catch (error) {
    console.error("Error changing password:", error)

    res.status(500).json({
      success: false,
      message: "Server error while changing password.",
    })
  }
}

// New: Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    // req.userId is set by the authenticateToken middleware
    const user = await User.findById(req.userId).select("-password").populate({
      path: "ratings.customerId",
      select: "profilePicture firstName lastName",
    })

    if (!user) {
      return res.status(404).json({ message: "User profile not found." })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ message: "Server error fetching user profile." })
  }
}

// New: Update User Profile Image (profilePicture or coverPhoto)
export const updateUserImage = async (req, res) => {
  try {
    const { imageType, imageUrl } = req.body
    const userId = req.userId // From authenticateToken middleware

    if (!userId || !imageType || !imageUrl) {
      return res.status(400).json({ message: "User ID, image type, and image URL are required." })
    }

    const updateField = {}
    if (imageType === "profilePicture") {
      updateField.profilePicture = imageUrl
    } else if (imageType === "coverPhoto") {
      updateField.coverPhoto = imageUrl
    } else {
      return res
        .status(400)
        .json({ message: "Invalid image type specified. Must be 'profilePicture' or 'coverPhoto'." })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateField },
      { new: true, runValidators: true }, // Return the updated document and run schema validators
    ).select("-password") // Exclude password from the returned user object

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." })
    }

    res.status(200).json({ message: `${imageType} updated successfully!`, user: updatedUser })
  } catch (error) {
    console.error(`Error updating user ${req.body?.imageType || "image"}:`, error)
    res.status(500).json({ message: "Failed to update image.", error: error.message })
  }
}

// New: Update User Profile Details
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId // From authenticateToken middleware
    const updates = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." })
    }

    const currentUser = await User.findById(userId)
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found." })
    }

    // Check if email is being changed and if the new email is already in use
    if (updates.email && updates.email !== currentUser.email) {
      const existingUserWithNewEmail = await User.findOne({ email: updates.email })

      // If an existing user is found AND that user is NOT the current user
      if (existingUserWithNewEmail && existingUserWithNewEmail._id.toString() !== userId) {
        return res.status(409).json({ message: "Email already in use. Please choose another one." })
      }
    }

    // Construct update object, handling nested fields like location
    const updateFields = {}
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "location" && typeof updates[key] === "object" && updates[key] !== null) {
          // If location is provided as an object, replace the entire location subdocument
          updateFields[key] = updates[key]
        } else {
          // For other fields, or if location is not an object (e.g., null or undefined),
          // directly assign the value.
          updateFields[key] = updates[key]
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }, // Return the updated document and run schema validators
    ).select("-password") // Exclude password from the returned user object

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update attempt." })
    }

    res.status(200).json({ message: "User profile updated successfully!", user: updatedUser })
  } catch (error) {
    console.error("Error updating user profile:", error)
    // Handle MongoDB duplicate key error specifically for email if it somehow bypasses the check above
    if (error.code === 11000 && error.message.includes("email")) {
      return res.status(409).json({ message: "A user with this email already exists." })
    }
    res.status(500).json({ message: "Failed to update user profile.", error: error.message })
  }
}

// NEW: Check Email Availability
export const checkEmailAvailability = async (req, res) => {
  const { email } = req.body
  const userId = req.userId // Get current user ID from authenticated token

  if (!email) {
    return res.status(400).json({ message: "Email is required." })
  }

  try {
    // Find a user with the given email, but exclude the current user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } })

    if (existingUser) {
      return res.status(200).json({ available: false, message: "This email is already in use by another account." })
    } else {
      return res.status(200).json({ available: true, message: "Email is available." })
    }
  } catch (error) {
    console.error("Error checking email availability:", error)
    res.status(500).json({ message: "Server error checking email availability." })
  }
}

export const registerProviderAdmin = async (req, res) => {
  try {
    const { accountType } = req.body

    // Only allow provider and admin account types for this endpoint
    if (!accountType || !["provider", "admin"].includes(accountType)) {
      return res.status(400).json({ message: "This endpoint only supports provider and admin account types." })
    }

    // Check if the requesting user has appropriate permissions
    const requestingUser = await User.findById(req.userId)
    if (!requestingUser) {
      return res.status(404).json({ message: "Requesting user not found." })
    }

    // Allow admin and COO account types to create provider/admin accounts
    if (requestingUser.accountType !== "admin" && requestingUser.accountType !== "coo") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admin or COO users can create provider/admin accounts." })
    }

    // Use the existing registerAccount logic
    return await registerAccount(req, res)
  } catch (error) {
    console.error("Provider/Admin registration error:", error)
    res.status(500).json({ message: "Server error during provider/admin registration." })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users with pagination support
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 100
    const skip = (page - 1) * limit

    // Build filter based on query parameters
    const filter = {}

    if (req.userId) {
      filter._id = { $ne: req.userId }
    }

    if (req.query.accountType) {
      filter.accountType = req.query.accountType
    }
    if (req.query.status) {
      filter.status = req.query.status
    }

    const users = await User.find(filter)
      .select("-password -otp -otpExpires -secretAnswer -secretCode -secretQuestion")
      .populate({
        path: "ratings.customerId",
        select: "profilePicture firstName lastName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalUsers = await User.countDocuments(filter)
    const totalPages = Math.ceil(totalUsers / limit)

    res.status(200).json({
      users,
      success: true,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.userId // From authenticateToken middleware

    console.log("[v0] Delete request for user ID:", id)
    console.log("[v0] Admin ID:", adminId)

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      })
    }

    // Check if the requesting user is an admin
    const admin = await User.findById(adminId)
    if (!admin || (admin.accountType !== "admin" && admin.accountType !== "coo")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    // Find and delete the user
    const userToDelete = await User.findById(id)
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      })
    }

    // Prevent admin from deleting themselves
    if (userToDelete._id.toString() === adminId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account.",
      })
    }

    await User.findByIdAndDelete(id)

    console.log("[v0] User deleted successfully:", id)

    res.status(200).json({
      success: true,
      message: "User account deleted successfully.",
    })
  } catch (error) {
    console.error("[v0] Error deleting user account:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting account.",
    })
  }
}

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, suspensionDuration, suspensionReason } = req.body
    const adminId = req.userId // From authenticateToken middleware

    console.log("[v0] Status update request for user ID:", id)
    console.log("[v0] New status:", status)
    console.log("[v0] Admin ID:", adminId)

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      })
    }

    if (
      !status ||
      !["pending", "active", "inactive", "suspended", "declined", "on review"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required (pending, active, inactive, suspended, declined, on review).",
      })
    }

    // Check if the requesting user is an admin
    const admin = await User.findById(adminId)
    if (!admin || (admin.accountType !== "admin" && admin.accountType !== "coo")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    // Find the user to update
    const userToUpdate = await User.findById(id)
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      })
    }

    // Prepare update object
    const updateFields = { status }

    // Handle suspension-specific fields
    if (status === "suspended") {
      if (!suspensionDuration || suspensionDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Suspension duration is required when suspending a user.",
        })
      }

      const suspensionStartDate = new Date()
      const suspensionEndDate = new Date(
        suspensionStartDate.getTime() + suspensionDuration * 24 * 60 * 60 * 1000
      )

      updateFields.suspensionDuration = suspensionDuration
      updateFields.suspensionStartDate = suspensionStartDate
      updateFields.suspensionEndDate = suspensionEndDate
      updateFields.suspensionReason = suspensionReason || "No reason provided"
    } else {
      // Clear suspension fields if status is not suspended
      updateFields.suspensionDuration = null
      updateFields.suspensionStartDate = null
      updateFields.suspensionEndDate = null
      updateFields.suspensionReason = null
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires -secretAnswer -secretCode -secretQuestion")

    console.log("[v0] User status updated successfully:", id)

    // ✅ Helper function to format suspension dates
    const formatDate = (date) => {
      if (!date) return null
      const d = new Date(date)
      const options = { year: "numeric", month: "short", day: "numeric" }
      const formatted = d.toLocaleDateString("en-US", options)
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" })
      return `${formatted} (${weekday})`
    }

    // ✅ Format suspension dates before sending response
    const formattedUser = {
      ...updatedUser.toObject(),
      suspensionStartDate: formatDate(updatedUser.suspensionStartDate),
      suspensionEndDate: formatDate(updatedUser.suspensionEndDate),
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      user: formattedUser,
    })
  } catch (error) {
    console.error("[v0] Error updating user status:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error while updating user status.",
    })
  }
}


export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { accountType } = req.body
    const adminId = req.userId // From authenticateToken middleware

    console.log("[v0] Role update request for user ID:", id)
    console.log("[v0] New role:", accountType)
    console.log("[v0] Admin ID:", adminId)

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      })
    }

    if (!accountType || !["customer", "coo", "provider", "admin"].includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: "Valid account type is required (customer, coo, provider, admin).",
      })
    }

    // Check if the requesting user is an admin
    const admin = await User.findById(adminId)
    if (!admin || (admin.accountType !== "admin" && admin.accountType !== "coo")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    // Find the user to update
    const userToUpdate = await User.findById(id)
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      })
    }

    // Prevent admin from changing their own role
    if (userToUpdate._id.toString() === adminId) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own account type.",
      })
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { accountType } },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpires -secretAnswer -secretCode -secretQuestion")

    console.log("[v0] User role updated successfully:", id)

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: updatedUser,
    })
  } catch (error) {
    console.error("[v0] Error updating user role:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error while updating user role.",
    })
  }
}

export const getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

export const bulkAddProviders = async (req, res) => {
  try {
    console.log("[v0] bulkAddProviders called")
    console.log("[v0] Request body:", req.body)

    const { providers, cooId } = req.body

    console.log("[v0] Providers array:", providers)
    console.log("[v0] COO ID:", cooId)

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      console.log("[v0] Invalid providers array")
      return res.status(400).json({ message: "Providers array is required and must not be empty" })
    }

    if (!cooId) {
      console.log("[v0] Missing cooId")
      return res.status(400).json({ message: "COO ID is required" })
    }

    // Verify that the cooId exists and is a valid COO
    console.log("[v0] Verifying COO user with ID:", cooId)
    const cooUser = await User.findById(cooId)

    if (!cooUser) {
      console.log("[v0] COO user not found")
      return res.status(404).json({ message: "COO user not found" })
    }

    console.log("[v0] COO user found:", cooUser.email, "Account type:", cooUser.accountType)

    if (cooUser.accountType !== "coo") {
      console.log("[v0] User is not a COO, account type:", cooUser.accountType)
      return res.status(400).json({ message: "The provided ID must belong to a COO account" })
    }

    const invalidProviders = []
    const validProviders = []

    console.log("[v0] Processing", providers.length, "providers")

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]
      console.log("[v0] Processing provider", i + 1, ":", provider.fullname)

      if (!provider.firstName ||
        !provider.lastName ||
        !provider.email ||
        !provider.location ||
        !provider.gender ||
        !provider.providerNumber) {
        console.log("[v0] Provider", i, "has missing required fields")
        invalidProviders.push({
          index: i,
          provider,
          reason: "Missing required fields (firstName, lastName, email, location, age, providerNumber)",
        })
      } else {
        let locationObject = {}
        if (typeof provider.location === "object" && provider.location !== null) {
          // If it's already an object, use it as-is
          locationObject = provider.location
        } else if (typeof provider.location === "string") {
          // If it's a string, convert to object with name property
          locationObject = { name: provider.location }
        } else {
          // Fallback for any other type
          locationObject = { name: "Not provided" }
        }

        const providerData = {
          accountType: "provider",
          cooId: cooId,
          firstName: provider.firstName,
          lastName: provider.lastName,
          email: provider.email,
          password: "mypassword123",
          mobileNumber: "000-000-0000",
          gender: "male",
          company: cooUser.businessName || "Home Services Inc.",
          location: locationObject,
          status: (provider.status || "active").toLowerCase(),
          isVerified: false,
          profilePicture: provider.avatar || "/placeholder.svg?height=40&width=40",
          bio: `Provider ID: ${provider.providerNumber}`,
        }
        console.log("[v0] Provider data prepared:", providerData)
        validProviders.push(providerData)
      }
    }

    console.log("[v0] Valid providers:", validProviders.length, "Invalid providers:", invalidProviders.length)

    if (invalidProviders.length > 0) {
      console.log("[v0] Returning error due to invalid providers")
      return res.status(400).json({
        message: "Some providers have invalid data",
        invalidProviders,
        validCount: validProviders.length,
        invalidCount: invalidProviders.length,
      })
    }

    console.log("[v0] Inserting", validProviders.length, "providers into database")
    console.log("[v0] Provider data before insert:", JSON.stringify(validProviders, null, 2))

    let insertedProviders = []
    try {
      insertedProviders = await User.create(validProviders)
      console.log("[v0] insertMany response type:", typeof insertedProviders)
      console.log("[v0] insertMany response:", insertedProviders)
      console.log("[v0] insertMany response length:", insertedProviders.length)
    } catch (insertError) {
      console.error("[v0] insertMany error:", insertError)
      console.error("[v0] insertMany error message:", insertError.message)
      console.error("[v0] insertMany error code:", insertError.code)
      console.error("[v0] insertMany error details:", JSON.stringify(insertError, null, 2))

      // If ordered: false, some documents might have been inserted despite errors
      if (insertError.insertedDocs && insertError.insertedDocs.length > 0) {
        insertedProviders = insertError.insertedDocs
        console.log("[v0] Partial insert - inserted", insertedProviders.length, "providers despite errors")
      } else {
        throw insertError
      }
    }

    console.log("[v0] Successfully inserted", insertedProviders.length, "providers")
    console.log(
      "[v0] Inserted provider IDs:",
      insertedProviders.map((p) => p._id),
    )

    res.status(201).json({
      message: "Providers added successfully",
      count: insertedProviders.length,
      providers: insertedProviders,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error bulk adding providers:", error)
    console.error("[v0] Error stack:", error.stack)

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log("[v0] Duplicate key error detected")
      return res.status(400).json({
        message: "Some providers have duplicate email addresses",
        error: error.message,
      })
    }

    if (error.name === "ValidationError") {
      console.log("[v0] Validation error:", error.message)
      return res.status(400).json({
        message: "Validation error while adding providers",
        error: error.message,
      })
    }

    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const fetchProviders = async (req, res) => {
  try {
    const cooId = req.userId // Get COO ID from authenticated token

    // Verify the user is a COO
    const cooUser = await User.findById(cooId)
    if (!cooUser || cooUser.accountType !== "coo") {
      return res.status(403).json({ message: "Access denied. Only COO users can fetch providers." })
    }

    const providers = await User.find({ cooId: cooId, accountType: "provider" })
      .select("-password -otp -otpExpires -secretAnswer -secretCode -secretQuestion")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "Providers fetched successfully",
      providers: providers,
      count: providers.length,
    })
  } catch (error) {
    console.error("Error fetching providers:", error)
    res.status(500).json({ message: "Server error fetching providers", error: error.message })
  }
}

export const updateUserVerification = async (req, res) => {
  try {
    const { userId } = req.params

    const { isVerified } = req.body
    const adminId = req.userId // From authenticateToken middleware

    console.log("[v0] Verification update request for user ID:", userId)
    console.log("[v0] New verification status:", isVerified)
    console.log("[v0] Admin ID:", adminId)

    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      })
    }

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Valid verification status is required (true or false).",
      })
    }

    // Check if the requesting user is an admin
    const admin = await User.findById(adminId)
    if (!admin || (admin.accountType !== "admin" && admin.accountType !== "coo")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    // Find the user to update
    const userToUpdate = await User.findById(userId)
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isVerified } },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpires -secretAnswer -secretCode -secretQuestion")

    console.log("[v0] User verification status updated successfully:", userId)

    res.status(200).json({
      success: true,
      message: `User ${isVerified ? "verified" : "unverified"} successfully.`,
      user: updatedUser,
    })
  } catch (error) {
    console.error("[v0] Error updating user verification status:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error while updating verification status.",
    })
  }
}

export const getProvidersByCoo = async (req, res) => {
  try {
    const { cooId } = req.params;
    console.log("[👥] Fetching providers for COO ID:", cooId);

    if (!cooId) {
      return res.status(400).json({ message: "COO ID is required." });
    }

    // Find users where accountType = "provider" and cooId = current COO
    const providers = await User.find({
      accountType: "provider",
      cooId: cooId,
    }).select("firstName lastName middleName businessName status profilePicture email createdAt");

    console.log(`[✅] Found ${providers.length} providers for COO ${cooId}.`);

    return res.status(200).json({ count: providers.length, providers });
  } catch (error) {
    console.error("[❌] Error fetching providers by COO:", error);
    return res.status(500).json({ message: "Server error while fetching providers." });
  }
}

export const getAdminAnalytics = async (req, res) => {
  try {
    console.log(`[CONTROLLER] getAdminAnalytics function started`)

    console.log(`[CONTROLLER] Fetching all bookings...`)
    const allBookings = await Booking.find()
    console.log(`[CONTROLLER] Total bookings found:`, allBookings.length)

    console.log(`[CONTROLLER] Fetching completed bookings...`)
    const completedBookings = await Booking.find({ status: "completed" })
    console.log(`[CONTROLLER] Completed bookings found:`, completedBookings.length)

    console.log(`[CONTROLLER] Fetching active bookings...`)
    const activeBookings = await Booking.find({ status: "active" })
    console.log(`[CONTROLLER] Active bookings found:`, activeBookings.length)

    console.log(`[CONTROLLER] Fetching pending bookings...`)
    const pendingBookings = await Booking.find({ status: "pending" })
    console.log(`[CONTROLLER] Pending bookings found:`, pendingBookings.length)

    console.log(`[CONTROLLER] Fetching ongoing bookings...`)
    const ongoingBookings = await Booking.find({ status: "ongoing" })
    console.log(`[CONTROLLER] Ongoing bookings found:`, ongoingBookings.length)

    // Calculate booking metrics
    const totalBookings = allBookings.length
    const completedCount = completedBookings.length
    const activeCount = activeBookings.length
    const pendingCount = pendingBookings.length
    const ongoingCount = ongoingBookings.length

    console.log(`[CONTROLLER] Booking metrics calculated:`, {
      totalBookings,
      completedCount,
      activeCount,
      pendingCount,
      ongoingCount,
    })

    // Calculate revenue metrics
    console.log(`[CONTROLLER] Calculating revenue metrics...`)
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalRate || 0)
    }, 0)

    const averageTransactionValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    console.log(`[CONTROLLER] Revenue metrics:`, {
      totalRevenue,
      averageTransactionValue,
    })

    // Calculate transaction completion rate
    const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0

    // Count new transactions this month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const newTransactionsThisMonth = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt)
      return bookingDate >= monthStart
    }).length

    console.log(`[CONTROLLER] Transaction metrics:`, {
      completionRate,
      newTransactionsThisMonth,
    })

    // Calculate positive feedback percentage (ratings >= 4)
    console.log(`[CONTROLLER] Calculating feedback metrics...`)
    const bookingsWithRatings = completedBookings.filter((b) => b.rating)
    const positiveRatings = bookingsWithRatings.filter((b) => b.rating >= 4)
    const positiveFeedbackPercentage =
      bookingsWithRatings.length > 0 ? Math.round((positiveRatings.length / bookingsWithRatings.length) * 100) : 0

    // Calculate average rating
    const totalRatingPoints = bookingsWithRatings.reduce((sum, b) => sum + (b.rating || 0), 0)
    const averageRating =
      bookingsWithRatings.length > 0 ? (totalRatingPoints / bookingsWithRatings.length).toFixed(1) : 0

    console.log(`[CONTROLLER] Feedback metrics:`, {
      bookingsWithRatings: bookingsWithRatings.length,
      positiveFeedbackPercentage,
      averageRating,
    })

    // Count users by type
    console.log(`[CONTROLLER] Counting users by type...`)
    const totalCustomers = await User.countDocuments({ accountType: "customer" })
    const totalProviders = await User.countDocuments({ accountType: "provider" })
    const totalCOOs = await User.countDocuments({ accountType: "coo" })
    const totalUsers = totalCustomers + totalProviders + totalCOOs

    console.log(`[CONTROLLER] User counts:`, {
      totalCustomers,
      totalProviders,
      totalCOOs,
      totalUsers,
    })

    // Count services
    console.log(`[CONTROLLER] Counting services...`)
    const totalServices = await Service.countDocuments()
    console.log(`[CONTROLLER] Total services:`, totalServices)

    // Get monthly booking data for chart
    console.log(`[CONTROLLER] Calculating monthly booking data...`)
    const monthlyBookings = Array(12).fill(0)
    allBookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const month = date.getMonth()
      monthlyBookings[month] += 1
    })
    console.log(`[CONTROLLER] Monthly bookings:`, monthlyBookings)

    // Get service performance data
    console.log(`[CONTROLLER] Aggregating service performance...`)
    const servicePerformance = await Booking.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$productName",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$pricing.totalRate" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])
    console.log(`[CONTROLLER] Service performance data:`, servicePerformance)

    // Get service breakdown by category
    console.log(`[CONTROLLER] Fetching services for category breakdown...`)
    const services = await Service.find()
    const serviceCategories = {}
    services.forEach((service) => {
      const category = service.mainCategory || "Other"
      serviceCategories[category] = (serviceCategories[category] || 0) + 1
    })
    console.log(`[CONTROLLER] Service categories:`, serviceCategories)

    // Get customer feedback data
    console.log(`[CONTROLLER] Fetching customer feedback from User ratings...`)
    const usersWithRatings = await User.find({ "ratings.0": { $exists: true } })
      .select("ratings")
      .limit(100)

    const customerFeedback = []
    usersWithRatings.forEach((user) => {
      if (user.ratings && user.ratings.length > 0) {
        user.ratings.slice(0, 4).forEach((rating) => {
          customerFeedback.push({
            type: rating.serviceType || "Service",
            customer: rating.customerName || "Anonymous",
            time: new Date(rating.reviewDate).toLocaleDateString(),
            rating: rating.rating || 0,
          })
        })
      }
    })
    console.log(`[CONTROLLER] Customer feedback items fetched:`, customerFeedback.length)

    // Get all services created
    console.log(`[CONTROLLER] Fetching all services created...`)
    const allServices = await Service.find()
      .populate({
        path: "cooId",
        select: "firstName lastName middleName businessName profilePicture location.name accountType",
      })
      .limit(10)
      .sort({ createdAt: -1 })

    console.log(`[CONTROLLER] Total services fetched:`, allServices.length)

    const servicesData = allServices.map((service, index) => {
      let createdBy = "Unknown"

      console.log(`[CONTROLLER] Processing service #${index + 1}:`, {
        serviceId: service._id,
        serviceName: service.name,
        cooIdExists: !!service.cooId,
        cooIdValue: service.cooId,
      })

      if (service.cooId) {
        if (service.cooId.accountType === "coo" && service.cooId.businessName) {
          createdBy = service.cooId.businessName
          console.log(`[CONTROLLER] Service "${service.name}" created by COO:`, {
            businessName: createdBy,
          })
        } else {
          const firstName = service.cooId.firstName || ""
          const lastName = service.cooId.lastName || ""
          const middleName = service.cooId.middleName || ""

          createdBy = `${firstName} ${middleName} ${lastName}`.trim()

          if (!createdBy || createdBy === "") {
            createdBy = "Unknown"
          }

          console.log(`[CONTROLLER] Service "${service.name}" created by:`, {
            firstName,
            lastName,
            middleName,
            fullName: createdBy,
          })
        }
      } else {
        console.log(
          `[CONTROLLER] Service "${service.name}" (ID: ${service._id}) has no cooId populated - this may indicate a data issue`,
        )
      }

      return {
        id: service._id.toString(),
        name: service.name,
        category: service.mainCategory || "General",
        createdBy: createdBy,
        price: service.price,
        description: service.description,
      }
    })
    console.log(`[CONTROLLER] Services data prepared:`, servicesData.length, servicesData)

    console.log(`[CONTROLLER] All analytics data compiled successfully`)

    res.status(200).json({
      success: true,
      analytics: {
        // Booking metrics
        totalBookings,
        completedBookings: completedCount,
        activeBookings: activeCount,
        pendingBookings: pendingCount,
        ongoingBookings: ongoingCount,

        // Revenue metrics
        totalRevenue: Math.round(totalRevenue),
        averageTransactionValue: Math.round(averageTransactionValue),
        newTransactionsThisMonth,

        // Quality metrics
        completionRate,
        positiveFeedbackPercentage,
        averageRating,

        // User metrics
        totalUsers,
        totalCustomers,
        totalProviders,
        totalCOOs,

        // Service metrics
        totalServices,

        // Chart data
        monthlyBookings,
        servicePerformance,
        serviceCategories,

        // Feedback and services
        customerFeedback,
        allServices: servicesData,
      },
    })
  } catch (error) {
    console.error(`[CONTROLLER] Error in getAdminAnalytics:`, error)
    console.error(`[CONTROLLER] Error message:`, error.message)
    console.error(`[CONTROLLER] Error stack:`, error.stack)

    res.status(500).json({
      message: "Failed to calculate admin analytics.",
      error: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    })
  }
}