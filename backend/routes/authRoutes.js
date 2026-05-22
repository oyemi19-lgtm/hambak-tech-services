import express from "express";

import {
  
  registerUser,
  loginUser,
  getMe,
  logoutUser
  
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

/* =========================
ROUTER
========================= */

const router = express.Router();

/* =========================
AUTH ROUTES
========================= */

/* REGISTER */

router.post(
  "/register",
  registerUser
);

/* LOGIN */

router.post(
  "/login",
  loginUser
);

/* CURRENT USER */

router.get(
  "/me",
  protect,
  getMe
);

/* LOGOUT */

router.get(
  "/logout",
  logoutUser
);

/* =========================
EXPORT
========================= */

export default router;