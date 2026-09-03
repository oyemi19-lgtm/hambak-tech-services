import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { inMemoryUsers } from "../config/inMemoryStore.js";

/* =========================
PROTECT ROUTES
========================= */

export const protect = async (req, res, next) => {
  try {
    let token;

    /* GET TOKEN */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    /* NO TOKEN */
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token"
      });
    }

    /* VERIFY TOKEN */
    const secret = process.env.JWT_SECRET || "hambak_default_jwt_secret_key_2024";
    const decoded = jwt.verify(token, secret);

    /* FIND USER */
    try {
      req.user = await User.findById(decoded.id).select("-password");
    } catch {
      // If MongoDB is offline, fallback to in-memory store
      req.user = null;
    }

    if (!req.user && inMemoryUsers.has(decoded.id)) {
      const u = inMemoryUsers.get(decoded.id);
      req.user = {
        _id: u._id,
        id: u._id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        wallet: u.wallet
      };
    }

    /* USER NOT FOUND */
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token failed"
    });
  }
};


/* =========================
ADMIN ONLY
========================= */

export const adminOnly = (req,res,next)=>{

if(req.user && req.user.role === "admin"){

next();

}else{

return res.status(403).json({

success:false,

message:
"Admin access only"

});

}

};

/* =========================
STUDENT ONLY
========================= */

export const studentOnly = (req,res,next)=>{

if(req.user && req.user.role === "student"){

next();

}else{

return res.status(403).json({

success:false,

message:
"Student access only"

});

}

};