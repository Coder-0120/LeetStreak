const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, leetcodeUsername } = req.body;
    const existUser = await userModel.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await userModel.create({ email, password: hashedPassword, leetcodeUsername });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await userModel.findOne({ email });
    if (!existUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, existUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "User login successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/user/me — returns current logged-in user info from JWT cookie
router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    email: req.user.email,
    leetcodeUsername: req.user.leetcodeUsername,
    remindersEnabled: req.user.remindersEnabled,
  });
});

// POST /api/user/logout — clears the JWT cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
});

// Update reminder preference
router.put("/update-reminder", authMiddleware, async (req, res) => {
  try {
    const { remindersEnabled } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.remindersEnabled = remindersEnabled;
    await user.save();
    return res.status(200).json({ message: "Reminder preference updated", remindersEnabled: user.remindersEnabled });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;