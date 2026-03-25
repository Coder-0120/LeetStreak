const cron = require("node-cron");
const User = require("../models/userModel");
const sendReminderEmail = require("../services/emailService");
const { fetchUserStats, hasUserSubmittedToday } = require("../services/leetcodeService");

const checkAndSendReminders = () => {
  // Runs every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running reminder & problemStats update...");

    try {
      const users = await User.find({ remindersEnabled: true });
      const now = new Date();
      const SIX_HOURS = 6 * 60 * 60 * 1000;

      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      for (let user of users) {
        // 1️⃣ Check if user submitted today
        const solvedToday = await hasUserSubmittedToday(user.leetcodeUsername);

        // 2️⃣ Fetch stats directly — reads difficulty counts, no looping
        const stats = await fetchUserStats(user.leetcodeUsername);

        // 3️⃣ Update problemStats
        user.problemStats.easy        = stats.easy;
        user.problemStats.medium      = stats.medium;
        user.problemStats.hard        = stats.hard;
        user.problemStats.totalSolved = stats.totalSolved;
        if (stats.totalSolved > 0) {
          user.problemStats.lastSolvedAt = new Date();
        }

        // 4️⃣ Update activity log if solved today
        if (solvedToday) {
          const hasEntryToday = user.activityLog.some((d) => {
            const x = new Date(d);
            return x >= todayStart && x <= todayEnd;
          });
          if (!hasEntryToday) user.activityLog.push(now);

          // Reset reminder since user already coded today
          user.lastReminderSent = null;
        } else {
          // 5️⃣ Send reminder if not solved today and last reminder > 6 hours ago
          const timeSinceLastReminder = user.lastReminderSent
            ? now - new Date(user.lastReminderSent)
            : Infinity;

          if (timeSinceLastReminder >= SIX_HOURS) {
            console.log(`Sending reminder to ${user.email}`);
            await sendReminderEmail(user.email, user.leetcodeUsername);
            user.lastReminderSent = now;
          }
        }

        // 6️⃣ Save
        await user.save();
      }

      console.log("Cron job complete: reminders sent & problemStats updated.");
    } catch (err) {
      console.error("Cron error:", err.message);
    }
  });
};

module.exports = checkAndSendReminders;