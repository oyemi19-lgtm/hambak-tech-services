import express from "express";
import {
  createTransaction,
  getMyTransactions,
  getSingleTransaction,
  getAllTransactions
} from "../controllers/transactionController.js";
import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

/* =========================
ROUTER
========================= */

const router = express.Router();

/* USER TRANSACTIONS */
router.post("/", protect, createTransaction);
router.get("/my", protect, getMyTransactions);

/* ADMIN ALL TRANSACTIONS */
router.get("/admin", protect, adminOnly, getAllTransactions);

/* SINGLE TRANSACTION */
router.get("/:id", protect, getSingleTransaction);

export default router;
