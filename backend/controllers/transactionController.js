import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

/* =========================
CREATE TRANSACTION
========================= */

export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, paymentMethod } = req.body;
    const reference = `HTS-${Date.now()}`;
    const userId = req.user?._id || req.user?.id;

    const transaction = await Transaction.create({
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
    const transactions = await Transaction.find({ user: userId }).sort({
      createdAt: -1
    });

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
    const transaction = await Transaction.findById(req.params.id);

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
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

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
