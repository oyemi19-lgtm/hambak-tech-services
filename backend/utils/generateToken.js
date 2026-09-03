import jwt from "jsonwebtoken";

/* =========================
GENERATE JWT TOKEN
========================= */

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || "hambak_default_jwt_secret_key_2024";
  const expiresIn = process.env.JWT_EXPIRE || "7d";

  return jwt.sign(
    {
      id: userId,
      role: role
    },
    secret,
    {
      expiresIn
    }
  );
};

export default generateToken;
