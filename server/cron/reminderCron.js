const cron = require("node-cron");
const User = require("../models/userModel");
const sendReminderEmail = require("../services/emailService");
const { hasUserSubmittedToday } = require("../services/leetcodeService");

const checkAndSendReminders = () => {
  // Runs every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running reminder check...");

    try {
      const users = await User.find({ remindersEnabled: true });

      const SIX_HOURS = 6 * 60 * 60 * 1000;
      const now = new Date();

      for (let user of users) {
        //  Check if user solved today
        const hasSolvedToday = await hasUserSubmittedToday(
          user.leetcodeUsername
        );

        if (hasSolvedToday) {
          // If solved → reset reminder timer
          user.lastReminderSent = null;
          await user.save();
          continue;
        }

        //  Check time since last reminder
        const timeSinceLastReminder = user.lastReminderSent
          ? now - new Date(user.lastReminderSent)
          : Infinity;

        if (timeSinceLastReminder >= SIX_HOURS) {
          console.log(`Sending reminder to ${user.email}`);

          await sendReminderEmail(user.email, user.leetcodeUsername);

          user.lastReminderSent = now;
          await user.save();
        }
      }
    } catch (err) {
      console.error("Reminder cron error:", err.message);
    }
  });
};

module.exports = checkAndSendReminders;