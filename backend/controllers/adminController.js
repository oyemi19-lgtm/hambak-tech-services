import User from "../models/User.js";
import Service from "../models/Service.js";

/* =========================
ADMIN DASHBOARD STATS
========================= */

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");
    const recentServices = await Service.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalServices,
        totalAdmins,
        totalStudents
      },
      recentUsers,
      recentServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
