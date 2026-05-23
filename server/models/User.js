/**
 * models/User.js — Mongoose User schema
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Optional for Google sign-in users
      minlength: 8,
      select: false, // never returned in queries by default
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);