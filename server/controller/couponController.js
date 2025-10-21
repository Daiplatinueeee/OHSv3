import { Coupon } from "../models/coupon.js"
import { Booking } from "../models/bookings.js"
import { Notification } from "../models/notification.js" 

// Generate a unique coupon code
const generateCouponCode = (prefix = "HANDY") => {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase()
  return `${prefix}${randomString}${timestamp}`
}

// Claim a first booking coupon
export const claimFirstBookingCoupon = async (req, res) => {
  try {
    const userId = req.userId
    const { companyId, companyName } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    if (!companyId || !companyName) {
      return res.status(400).json({ message: "Company ID and name are required." })
    }

    // Check if user already has a coupon for this company
    const existingCoupon = await Coupon.findOne({
      userId,
      companyId,
      couponType: "first_booking",
    })

    if (existingCoupon) {
      return res.status(400).json({
        message: "You have already claimed a coupon for this company.",
        coupon: existingCoupon,
      })
    }

    // Create new coupon
    const couponCode = generateCouponCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Valid for 30 days

    const newCoupon = new Coupon({
      userId,
      companyId,
      companyName,
      code: couponCode,
      discountType: "percentage",
      discountValue: 15, // 15% discount
      maxDiscount: 500, // Maximum ₱500 discount
      minPurchase: 200, // Minimum ₱200 booking
      expiresAt,
      couponType: "first_booking",
      description: `15% off your next booking with ${companyName} (up to ₱500)`,
    })

    await newCoupon.save()

    res.status(201).json({
      message: "Coupon claimed successfully!",
      coupon: newCoupon,
    })
  } catch (error) {
    console.error("Error claiming coupon:", error)
    res.status(500).json({
      message: "Failed to claim coupon.",
      error: error.message,
    })
  }
}

// Get all coupons for a user
export const getUserCoupons = async (req, res) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    const { companyId, isValid } = req.query

    const filter = { userId }

    if (companyId) {
      filter.companyId = companyId
    }

    if (isValid === "true") {
      filter.isUsed = false
      filter.expiresAt = { $gt: new Date() }
    }

    const coupons = await Coupon.find(filter)
      .populate({
        path: "companyId",
        select:
          "businessName firstName lastName middleName profilePicture aboutCompany averageRating totalReviews location accountType",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      coupons,
      count: coupons.length,
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    res.status(500).json({
      message: "Failed to fetch coupons.",
      error: error.message,
    })
  }
}

// Validate a coupon
export const validateCoupon = async (req, res) => {
  try {
    const userId = req.userId
    const { code, companyId, bookingAmount } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    if (!code || !companyId || bookingAmount === undefined) {
      return res.status(400).json({
        message: "Coupon code, company ID, and booking amount are required.",
      })
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      userId,
      companyId,
    })

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found or not valid for this company.",
      })
    }

    // Check if coupon is already used
    if (coupon.isUsed) {
      return res.status(400).json({
        message: "This coupon has already been used.",
      })
    }

    // Check if coupon is expired
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({
        message: "This coupon has expired.",
      })
    }

    // Check minimum purchase requirement
    if (bookingAmount < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum booking amount of ₱${coupon.minPurchase} required to use this coupon.`,
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (bookingAmount * coupon.discountValue) / 100
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else {
      discountAmount = coupon.discountValue
    }

    const finalAmount = bookingAmount - discountAmount

    res.status(200).json({
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
      message: "Coupon is valid!",
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    res.status(500).json({
      message: "Failed to validate coupon.",
      error: error.message,
    })
  }
}

// Apply coupon to a booking
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.userId
    const { code, bookingId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    if (!code || !bookingId) {
      return res.status(400).json({
        message: "Coupon code and booking ID are required.",
      })
    }

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, userId })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." })
    }

    // Find the coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      userId,
      companyId: booking.providerId,
    })

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found or not valid for this booking.",
      })
    }

    // Validate coupon
    if (coupon.isUsed) {
      return res.status(400).json({ message: "This coupon has already been used." })
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "This coupon has expired." })
    }

    if (booking.pricing.totalRate < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum booking amount of ₱${coupon.minPurchase} required.`,
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (booking.pricing.totalRate * coupon.discountValue) / 100
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else {
      discountAmount = coupon.discountValue
    }

    // Update booking with coupon
    booking.pricing.couponCode = coupon.code
    booking.pricing.couponDiscount = discountAmount
    booking.pricing.finalRate = booking.pricing.totalRate - discountAmount

    await booking.save()

    // Mark coupon as used
    coupon.isUsed = true
    coupon.usedAt = new Date()
    coupon.bookingId = bookingId

    await coupon.save()

    res.status(200).json({
      message: "Coupon applied successfully!",
      booking,
      discountAmount,
    })
  } catch (error) {
    console.error("Error applying coupon:", error)
    res.status(500).json({
      message: "Failed to apply coupon.",
      error: error.message,
    })
  }
}

// Create a custom coupon (for company/provider use)
export const createCoupon = async (req, res) => {
  try {
    const companyId = req.userId; // The authenticated user creating the coupon
    let {
      userId,
      code,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      expiresAt,
      couponType,
      description,
      companyName,
    } = req.body;

    if (!userId || !code || !discountValue || !expiresAt || !companyName) {
      return res.status(400).json({
        message: "User ID, coupon code, discount value, expiration date, and company name are required.",
      });
    }

    // Parse userId if it's a stringified JSON object
    if (typeof userId === "string") {
      try {
        const parsedUser = JSON.parse(userId);
        userId = parsedUser._id || parsedUser.id || userId;
      } catch (e) {
        // If parsing fails, assume it's already a valid ID string
      }
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: "This coupon code already exists. Please use a different code.",
      });
    }

    // Create new coupon
    const newCoupon = new Coupon({
      userId,
      companyId,
      companyName,
      code: code.toUpperCase(),
      discountType: discountType || "percentage",
      discountValue,
      maxDiscount: maxDiscount || 0,
      minPurchase: minPurchase || 0,
      expiresAt: new Date(expiresAt),
      couponType: couponType || "promotional",
      description:
        description ||
        `${discountValue}${discountType === "percentage" ? "%" : "₱"} off your booking`,
    });

    await newCoupon.save();

    // 🕒 Create Notification when coupon is created
    const formattedDate = new Date(expiresAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const notification = new Notification({
      userId: userId,
      title: "New Coupon Available 🎟️",
      type: "info",
      message: `A new coupon "${code.toUpperCase()}" from ${companyName} is now available! Enjoy ${
        discountType === "percentage" ? discountValue + "%" : "₱" + discountValue
      } off your next booking. Valid until ${formattedDate}.`,
      status: "unread",
      link: `/coupons/${newCoupon._id}`,
    });

    await notification.save();
    console.log("✅ Notification created: New Coupon Available");

    res.status(201).json({
      message: "Coupon created successfully and notification sent!",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      message: "Failed to create coupon.",
      error: error.message,
    });
  }
}

// Get all coupons created by a company
export const getCompanyCoupons = async (req, res) => {
  try {
    const companyId = req.userId

    if (!companyId) {
      return res.status(400).json({ message: "Company ID not found in request." })
    }

    const coupons = await Coupon.find({ companyId })
      .sort({ createdAt: -1 })

    res.status(200).json({
      coupons,
      count: coupons.length,
    })
  } catch (error) {
    console.error("Error fetching company coupons:", error)
    res.status(500).json({
      message: "Failed to fetch coupons.",
      error: error.message,
    })
  }
}

// Delete a coupon
export const deleteCoupon = async (req, res) => {
  try {
    const companyId = req.userId
    const { couponId } = req.params

    if (!companyId) {
      return res.status(400).json({ message: "Company ID not found in request." })
    }

    const coupon = await Coupon.findOne({ _id: couponId, companyId })

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found or you don't have permission to delete it.",
      })
    }

    // Don't allow deletion if coupon has been used
    if (coupon.isUsed) {
      return res.status(400).json({
        message: "Cannot delete a coupon that has already been used.",
      })
    }

    await Coupon.deleteOne({ _id: couponId })

    res.status(200).json({
      message: "Coupon deleted successfully.",
    })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    res.status(500).json({
      message: "Failed to delete coupon.",
      error: error.message,
    })
  }
}

// Create compensation coupon (for admin/system use)
export const createCompensationCoupon = async (req, res) => {
  try {
    const { userId, companyId, companyName, discountValue, reason } = req.body

    if (!userId || !companyId || !companyName || !discountValue) {
      return res.status(400).json({
        message: "User ID, company ID, company name, and discount value are required.",
      })
    }

    const couponCode = generateCouponCode("COMP")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60) // Valid for 60 days

    const newCoupon = new Coupon({
      userId,
      companyId,
      companyName,
      code: couponCode,
      discountType: "percentage",
      discountValue,
      maxDiscount: 1000,
      minPurchase: 0,
      expiresAt,
      couponType: "compensation",
      description: reason || `Compensation coupon for ${companyName}`,
    })

    await newCoupon.save()

    res.status(201).json({
      message: "Compensation coupon created successfully!",
      coupon: newCoupon,
    })
  } catch (error) {
    console.error("Error creating compensation coupon:", error)
    res.status(500).json({
      message: "Failed to create compensation coupon.",
      error: error.message,
    })
  }
}

// Delete expired coupons (cleanup job)
export const deleteExpiredCoupons = async (req, res) => {
  try {
    const result = await Coupon.deleteMany({
      expiresAt: { $lt: new Date() },
      isUsed: false,
    })

    res.status(200).json({
      message: "Expired coupons deleted successfully.",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting expired coupons:", error)
    res.status(500).json({
      message: "Failed to delete expired coupons.",
      error: error.message,
    })
  }
}

// Send coupon to a user by email
export const sendCouponToUser = async (req, res) => {
  try {
    const companyId = req.userId;
    const { couponId, recipientEmail } = req.body;

    if (!couponId || !recipientEmail) {
      return res.status(400).json({
        message: "Coupon ID and recipient email are required.",
      });
    }

    // Find the original coupon
    const originalCoupon = await Coupon.findOne({
      _id: couponId,
      companyId: companyId,
    });

    if (!originalCoupon) {
      return res.status(404).json({
        message: "Coupon not found or you don't have permission to send it.",
      });
    }

    // Check if coupon is already used or expired
    if (originalCoupon.isUsed) {
      return res.status(400).json({
        message: "Cannot send a coupon that has already been used.",
      });
    }

    if (new Date() > originalCoupon.expiresAt) {
      return res.status(400).json({
        message: "Cannot send an expired coupon.",
      });
    }

    // Find the recipient user by email
    const { User } = await import("../models/user.js");
    const recipientUser = await User.findOne({ email: recipientEmail });

    if (!recipientUser) {
      return res.status(404).json({
        message: `No user found with email: ${recipientEmail}`,
      });
    }

    // Check if this user already has this coupon
    const existingUserCoupon = await Coupon.findOne({
      userId: recipientUser._id,
      companyId: originalCoupon.companyId,
      code: originalCoupon.code,
    });

    if (existingUserCoupon) {
      return res.status(400).json({
        message: `This user already has a coupon with code ${originalCoupon.code}`,
      });
    }

    // Generate a unique coupon code for the recipient
    const generateUniqueCouponCode = async (baseCode) => {
      let uniqueCode = baseCode;
      let counter = 1;
      let codeExists = await Coupon.findOne({ code: uniqueCode });

      while (codeExists) {
        uniqueCode = `${baseCode}-${counter}`;
        codeExists = await Coupon.findOne({ code: uniqueCode });
        counter++;
      }

      return uniqueCode;
    };

    const uniqueCode = await generateUniqueCouponCode(originalCoupon.code);

    // Create a new coupon for the recipient
    const newCoupon = new Coupon({
      userId: recipientUser._id,
      companyId: originalCoupon.companyId,
      companyName: originalCoupon.companyName,
      code: uniqueCode,
      discountType: originalCoupon.discountType,
      discountValue: originalCoupon.discountValue,
      maxDiscount: originalCoupon.maxDiscount,
      minPurchase: originalCoupon.minPurchase,
      expiresAt: originalCoupon.expiresAt,
      couponType: originalCoupon.couponType,
      description: originalCoupon.description,
    });

    await newCoupon.save();

    // 🕒 Create Notification for the Recipient
    const formattedDate = new Date(originalCoupon.expiresAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const notification = new Notification({
      userId: recipientUser._id,
      title: "🎁 You've Received a Coupon!",
      type: "success",
      message: `You’ve received a special coupon "${uniqueCode}" from ${originalCoupon.companyName}! Enjoy ${
        originalCoupon.discountType === "percentage"
          ? originalCoupon.discountValue + "%"
          : "₱" + originalCoupon.discountValue
      } off your next booking. Valid until ${formattedDate}.`,
      status: "unread",
      link: `/coupons/${newCoupon._id}`,
    });

    await notification.save();
    console.log("✅ Notification created: Coupon Sent to User");

    // Optional: notify the company that the coupon was sent
    const companyNotification = new Notification({
      userId: companyId,
      title: "Coupon Sent Successfully",
      type: "info",
      message: `Coupon "${uniqueCode}" has been successfully sent to ${recipientEmail}.`,
      status: "unread",
      link: `/company/coupons/${newCoupon._id}`,
    });

    await companyNotification.save();
    console.log("✅ Notification created: Coupon Sent Confirmation for Company");

    res.status(201).json({
      message: `Coupon sent successfully to ${recipientEmail} and notification delivered.`,
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Error sending coupon:", error);
    res.status(500).json({
      message: "Failed to send coupon.",
      error: error.message,
    });
  }
}