import express from "express";

import {
  
  getDashboardStats
  
} from "../controllers/adminController.js";

import {
  
  protect,
  adminOnly
  
} from "../middleware/authMiddleware.js";

/* =========================
ROUTER
========================= */

const router = express.Router();

/* =========================
ADMIN DASHBOARD
========================= */

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getDashboardStats
);

/* =========================
EXPORT
========================= */

export default router;