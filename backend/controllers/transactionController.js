import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { inMemoryTransactions, inMemoryUsers } from "../config/inMemoryStore.js";

/* =========================
CREATE TRANSACTION
========================= */

export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, paymentMethod } = req.body;
    const reference = `HTS-${Date.now()}`;
    const userId = req.user?._id || req.user?.id;

    let transaction;
    try {
      transaction = await Transaction.create({
        user: userId,
        type,
        amount,
        description,
        paymentMethod,
        reference,
        status: "successful"
      });

      if (type === "wallet_funding") {
        await User.findByIdAndUpdate(userId, {
          $inc: { wallet: Number(amount) }
        });
      } else if (type === "withdrawal") {
        await User.findByIdAndUpdate(userId, {
          $inc: { wallet: -Number(amount) }
        });
      }
    } catch {
      // In-memory fallback
      transaction = {
        _id: `tx_${Date.now()}`,
        user: userId,
        type,
        amount: Number(amount),
        description,
        paymentMethod,
        reference,
        status: "successful",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryTransactions.unshift(transaction);

      const memUser = inMemoryUsers.get(userId);
      if (memUser) {
        if (type === "wallet_funding") {
          memUser.wallet = (memUser.wallet || 0) + Number(amount);
        } else if (type === "withdrawal") {
          memUser.wallet = Math.max(0, (memUser.wallet || 0) - Number(amount));
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET MY TRANSACTIONS
========================= */

export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let transactions = [];

    try {
      transactions = await Transaction.find({ user: userId }).sort({
        createdAt: -1
      });
    } catch {
      transactions = inMemoryTransactions.filter((t) => t.user === userId);
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET SINGLE TRANSACTION
========================= */

export const getSingleTransaction = async (req, res) => {
  try {
    let transaction = null;
    try {
      transaction = await Transaction.findById(req.params.id);
    } catch {
      transaction = inMemoryTransactions.find((t) => t._id === req.params.id);
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
ADMIN: GET ALL TRANSACTIONS
========================= */

export const getAllTransactions = async (req, res) => {
  try {
    let transactions = [];
    try {
      transactions = await Transaction.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    } catch {
      transactions = inMemoryTransactions;
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
