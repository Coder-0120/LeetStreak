require("dotenv").config();

const { BrevoClient } = require("@getbrevo/brevo");

// Create client
const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendReminderEmail = async (toEmail, username) => {
  try {
    await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: "LeetStreak",
        email: process.env.SENDER_EMAIL,
      },
      to: [
        {
          email: toEmail,
        },
      ],
      subject: "⚡ LeetCode Reminder - Keep Your Streak Alive!",
      htmlContent: `
        <h2>Hi ${username} 👋</h2>
        <p>You haven't solved any LeetCode problem today.</p>
        <p>Don't break your streak! 🚀</p>
        <a href="https://leetcode.com/problemset/"
           style="background:orange;padding:10px 15px;color:white;text-decoration:none;border-radius:5px;">
           Solve Now
        </a>
      `,
    });

    console.log("Email sent successfully to", toEmail);
  } catch (error) {
    console.error("Brevo error:", error.message);
  }
};

module.exports = sendReminderEmail;