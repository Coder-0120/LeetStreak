const express=require('express');
const app=express();
const cors=require("cors");
const dotenv=require("dotenv");
const connectDB = require('./config/db');
const userRoutes=require("./routes/userRoutes");
app.use(cors());
app.use(express.json());
dotenv.config();
connectDB();
app.get("/",(req,res)=>{
    res.send("hello world");
})
app.use('/api/user',userRoutes);
app.listen(5000,()=>{
    console.log("Server is running on port 5000");
    
})
