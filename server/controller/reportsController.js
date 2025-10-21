import { Report } from "../models/reports.js"
import { User } from "../models/user.js" // Assuming User model exists

export const createReport = async (req, res) => {
  try {
    const {
      reporterId,
      reporterEmail,
      reporterName,
      sellerId,
      sellerName,
      sellerEmail,
      reportReason,
      reportDetails,
      proofImages,
    } = req.body

    // Validate required fields
    if (
      !reporterId ||
      !reporterEmail ||
      !reporterName ||
      !sellerId ||
      !sellerName ||
      !reportReason ||
      !reportDetails ||
      !proofImages ||
      proofImages.length === 0
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: reporterId, reporterEmail, reporterName, sellerId, sellerName, reportReason, reportDetails, and at least one proof image",
      })
    }

    const reporter = await User.findById(reporterId).select("profilePicture")
    const seller = await User.findById(sellerId).select("profilePicture")

    // Create new report with profile pictures
    const newReport = new Report({
      reporterId,
      reporterEmail,
      reporterName,
      reporterProfilePicture: reporter?.profilePicture || null,
      sellerId,
      sellerName,
      sellerEmail: sellerEmail || null,
      sellerProfilePicture: seller?.profilePicture || null,
      reportReason,
      reportDetails,
      proofImages,
      status: "pending",
    })

    // Save to database
    const savedReport = await newReport.save()

    console.log(`[${new Date().toISOString()}] Report created successfully:`, savedReport._id)

    res.status(201).json({
      message: "Report submitted successfully",
      report: savedReport,
    })
  } catch (error) {
    console.error("Error creating report:", error)
    res.status(500).json({
      message: "Failed to create report",
      error: error.message,
    })
  }
}

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "firstName lastName profilePicture email")
      .populate("sellerId", "firstName lastName profilePicture email businessName")
      .sort({ createdAt: -1 })

    console.log(`[${new Date().toISOString()}] Fetched ${reports.length} reports`)

    res.status(200).json({
      message: "Reports fetched successfully",
      reports: reports,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    })
  }
}

export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params
    const { status } = req.body

    if (!status || !["pending", "under_review", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: pending, under_review, resolved, dismissed",
      })
    }

    const updatedReport = await Report.findByIdAndUpdate(reportId, { status, updatedAt: Date.now() }, { new: true })

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" })
    }

    console.log(`[${new Date().toISOString()}] Report ${reportId} status updated to ${status}`)

    res.status(200).json({
      message: "Report status updated successfully",
      report: updatedReport,
    })
  } catch (error) {
    console.error("Error updating report status:", error)
    res.status(500).json({
      message: "Failed to update report status",
      error: error.message,
    })
  }
}
