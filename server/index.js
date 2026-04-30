const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// 🔥 LOAD ENV FIRST
dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");
const adminRoutes = require("./routes/adminRoute");

// ✅ Correct import
const { GoogleGenAI } = require("@google/genai");

// ✅ Use API key AFTER dotenv
const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// DB + Cron
connectDB();
const checkAndSendReminders = require("./cron/reminderCron");
checkAndSendReminders();

// Test route
app.get("/", (req, res) => {
  res.send("hello world");
});

// 🔥 AI ROUTE
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        answer: "❌ Question is required",
      });
    }

    // 🔥 DSA FILTER (important for your project)
    const isDSA = /(array|stack|queue|tree|graph|dp|linked list|sorting|search)/i.test(question);

    if (!isDSA) {
      return res.json({
        answer: "❌ Ask only DSA-related questions.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `
You are a DSA Instructor.
Answer ONLY DSA questions.
Explain clearly with examples and code.
`,
      },
    });

    res.json({
      answer: response.text,
    });

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      answer: "⚠️ Server error. Try again.",
    });
  }
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leetcode", leetcodeRoutes);

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});