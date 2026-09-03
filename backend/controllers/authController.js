import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import User from "../models/User.js";
import { inMemoryUsers } from "../config/inMemoryStore.js";

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
    let existingUser = null;
    try {
      existingUser = await User.findOne({
        $or: [{ email }, { username: safeUsername }]
      });
    } catch {
      // If Mongo is offline, check in-memory store
      existingUser = inMemoryUsers.get(email) || inMemoryUsers.get(safeUsername);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    /* CREATE USER */
    let user;
    try {
      user = await User.create({
        name: name || safeUsername,
        username: safeUsername,
        email,
        phone: phone || "0000000000",
        password,
        role
      });
    } catch {
      // In-memory fallback
      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        _id: `usr_${Date.now()}`,
        name: name || safeUsername,
        username: safeUsername,
        email,
        phone: phone || "0000000000",
        password: hashedPassword,
        role,
        wallet: 0,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryUsers.set(user._id, user);
      inMemoryUsers.set(user.email, user);
      inMemoryUsers.set(user.username, user);
    }

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
    let user = null;
    let isMatch = false;

    try {
      user = await User.findOne({
        $or: [{ email }, { username: email }]
      });
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } catch {
      user = null;
    }

    // Fallback to in-memory store
    if (!user) {
      const memoryUser = inMemoryUsers.get(email);
      if (memoryUser) {
        isMatch = await bcrypt.compare(password, memoryUser.password);
        if (isMatch) {
          user = memoryUser;
        }
      }
    }

    if (!user || !isMatch) {
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
    let user = null;
    try {
      user = await User.findById(req.user.id || req.user._id).select("-password");
    } catch {
      user = null;
    }

    if (!user) {
      user = req.user;
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
