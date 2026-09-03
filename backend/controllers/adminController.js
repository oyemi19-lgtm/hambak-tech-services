import User from "../models/User.js";
import Service from "../models/Service.js";
import { inMemoryUsers, inMemoryServices } from "../config/inMemoryStore.js";

/* =========================
ADMIN DASHBOARD STATS
========================= */

export const getDashboardStats = async (req, res) => {
  try {
    let totalUsers = 0;
    let totalServices = 0;
    let totalAdmins = 0;
    let totalStudents = 0;
    let recentUsers = [];
    let recentServices = [];
    let revenue = 0;

    try {
      totalUsers = await User.countDocuments();
      totalServices = await Service.countDocuments();
      totalAdmins = await User.countDocuments({ role: "admin" });
      totalStudents = await User.countDocuments({ role: "student" });
      recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-password");
      recentServices = await Service.find()
        .sort({ createdAt: -1 })
        .limit(5);
    } catch {
      // In-memory fallback
      const uniqueUsers = Array.from(new Set(Array.from(inMemoryUsers.values())));
      totalUsers = uniqueUsers.length;
      totalServices = inMemoryServices.length;
      totalAdmins = uniqueUsers.filter((u) => u.role === "admin").length;
      totalStudents = uniqueUsers.filter((u) => u.role === "student").length;
      recentUsers = uniqueUsers.slice(0, 5).map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      }));
      recentServices = inMemoryServices.slice(0, 5);
      revenue = 175000;
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalServices,
        totalAdmins,
        totalStudents,
        revenue
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
