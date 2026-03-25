// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const adminModel = require("../models/adminModel");

// -------------------------
// Admin login
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existAdmin = await adminModel.findOne({ email });
    if (!existAdmin || existAdmin.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Return a token so the frontend can store it in localStorage
    return res.status(200).json({ message: "Admin login successfully", token: "admin-token" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// -------------------------
// 1. Get all users — full fields needed by dashboard
// -------------------------
router.get("/users", async (req, res) => {
  try {
    const {
      sortBy = "problemStats.totalSolved",
      order = "desc",
      skip = 0,
      limit = 200,
    } = req.query;

    const users = await User.find({})
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .select(
        "email leetcodeUsername problemStats activityLog " +
        "lastReminderSent remindersEnabled createdAt updatedAt"
      )
      .lean(); // plain JS objects — faster, no Mongoose overhead

    res.json(users);
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// 2. Stats — used by dashboard Overview cards
// -------------------------
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();

    // Today's window (local midnight → 23:59:59)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // First day of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeToday,
      newThisMonth,
      remindersDisabled,
      allUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        activityLog: { $elemMatch: { $gte: todayStart, $lte: todayEnd } },
      }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      User.countDocuments({ remindersEnabled: false }),
      // For avgStreak + remindersSentToday we need activityLog + lastReminderSent
      User.find({})
        .select("activityLog lastReminderSent remindersEnabled")
        .lean(),
    ]);

    // Reminders sent today (lastReminderSent falls within today's window)
    const remindersSentToday = allUsers.filter(u => {
      if (!u.lastReminderSent) return false;
      const d = new Date(u.lastReminderSent);
      return d >= todayStart && d <= todayEnd;
    }).length;

    // Average current streak across users who have any activity
    function currentStreak(activityLog) {
      if (!activityLog || !activityLog.length) return 0;
      const days = [
        ...new Set(activityLog.map(d => new Date(d).toISOString().slice(0, 10))),
      ]
        .filter(Boolean)
        .sort()
        .reverse();
      let streak = 0;
      let expected = new Date().toISOString().slice(0, 10);
      for (const d of days) {
        if (d === expected) {
          streak++;
          const prev = new Date(new Date(expected).getTime() - 86400000);
          expected = prev.toISOString().slice(0, 10);
        } else if (d < expected) {
          break;
        }
      }
      return streak;
    }

    const activeUsers = allUsers.filter(u => u.activityLog && u.activityLog.length > 0);
    const avgStreak =
      activeUsers.length > 0
        ? Math.round(
            activeUsers.reduce((sum, u) => sum + currentStreak(u.activityLog), 0) /
            activeUsers.length
          )
        : 0;

    res.json({
      totalUsers,
      activeToday,
      remindersSentToday,
      avgStreak,
      newThisMonth,
      remindersDisabled,
    });
  } catch (err) {
    console.error("GET /stats error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// 3. Daily Active Users
// -------------------------
router.get("/daily-active", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const users = await User.find({
      activityLog: { $elemMatch: { $gte: start, $lte: end } },
    }).select("_id");

    res.json({ dateRange: { start: startDate, end: endDate }, activeUsers: users.length });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// 4. Leaderboard
// -------------------------
router.get("/leaderboard", async (req, res) => {
  try {
    const { sortBy = "problemStats.totalSolved", order = "desc", limit = 20 } = req.query;

    const users = await User.find({})
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .limit(Number(limit))
      .select("leetcodeUsername problemStats")
      .lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;