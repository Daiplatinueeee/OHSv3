import UserActivity from "../models/userActivity.js";

export const fetchUserActivities = async (req, res) => {
  try {
    // Always fetch all activities for admin
    const activities = await UserActivity.find({})
      .populate("userId", "fullname email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user activities.",
      error: error.message,
    });
  }
};