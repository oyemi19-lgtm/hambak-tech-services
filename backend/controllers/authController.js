import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import User from "../models/User.js";

/* =========================
REGISTER USER
========================= */

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      password,
      role = "customer"
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const safeUsername = username || email.split("@")[0];

    /* CHECK EXISTING USER IN MONGO */
    const existingUser = await User.findOne({
      $or: [{ email }, { username: safeUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    /* CREATE USER */
    const user = await User.create({
      name: name || safeUsername,
      username: safeUsername,
      email,
      phone: phone || "0000000000",
      password,
      role
    });

    /* GENERATE TOKEN */
    const token = generateToken(user._id, user.role);

    /* RESPONSE */
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
LOGIN USER
========================= */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* CHECK INPUT */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    /* FIND USER */
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    /* GENERATE TOKEN */
    const token = generateToken(user._id, user.role);

    /* RESPONSE */
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET CURRENT USER
========================= */

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
LOGOUT USER
========================= */

export const logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};
