// models/User.js
const mongoose = require("mongoose");

const problemStatsSchema = new mongoose.Schema({
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  contestRating: { type: Number, default: 0 },
  lastSolvedAt: { type: Date, default: null },
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  leetcodeUsername: { type: String, required: true },

  problemStats: { type: problemStatsSchema, default: () => ({}) },

  // Track activity (every day user solved something)
  activityLog: [{ type: Date }],

  // Track when reminder was last sent
  lastReminderSent: { type: Date, default: null },

  // Allow user to enable/disable reminders
  remindersEnabled: { type: Boolean, default: true },

}, { timestamps: true });

// Index for faster sorting/search
userSchema.index({ "problemStats.totalSolved": -1 });
userSchema.index({ activityLog: 1 });

module.exports = mongoose.model("User", userSchema);