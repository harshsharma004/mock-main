/**
 * middleware/authMiddleware.js — JWT verification middleware
 *
 * Usage:
 *   const { protect } = require("../middleware/authMiddleware");
 *   router.get("/history", protect, historyHandler);
 *
 * Expects header:  Authorization: Bearer <token>
 */


const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token signature + expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user to request object (password excluded by schema default)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Not authorized. Invalid token." });
  }
};

module.exports = { protect };