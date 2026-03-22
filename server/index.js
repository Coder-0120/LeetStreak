const express=require('express');
const app=express();
const cors=require("cors");
const dotenv=require("dotenv");
const connectDB = require('./config/db');
const userRoutes=require("./routes/userRoutes");
const leetcodeRoutes=require("./routes/leetcodeRoutes");
const cookieParser = require("cookie-parser");
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // 🔥 VERY IMPORTANT
  })
);app.use(express.json());
app.use(cookieParser());
dotenv.config();
connectDB();
const checkAndSendReminders = require("./cron/reminderCron");
// checkAndSendReminders();
app.get("/",(req,res)=>{
    res.send("hello world");
})
app.use('/api/user',userRoutes);
app.use('/api/leetcode',leetcodeRoutes);
app.listen(5000,()=>{
    console.log("Server is running on port 5000");
    
})
