const express=require("express");
const router=express.Router();
const userModel=require("../models/userModel");


// to register new user
router.post("/register",async(req,res)=>{
    try{
        const {email,password,leetcodeUsername}=req.body;
        const existUser=await userModel.findOne({email});
        if(existUser){
            return res.status(400).json({message:"User already exist"});
        }
        const newUser = await userModel.create({email,password,leetcodeUsername});
        return res.status(201).json({message:"User created successfully",data:newUser});
    }
    catch{
        return res.status(500).json({message:"Internal server error"});
    }
})

// to login user
router.post("/login",async(req,res)=>{
    try{
        const{email,password}=req.body;
        const existUser=await userModel.findOne({email});
        if(!existUser || existUser.password!=password){
            return res.status(400).json({message:"Invalid credentials"});
        }
        return res.status(201).json({message:"User login successfully",data:existUser});
    }
    catch(error){
        return res.status(400).json({message:"Internal server error"});
    }
})
router.put("/update-reminder/:userId",async(req,res)=>{
    try{
        const {userId}=req.params;
        const {remindersEnabled}=req.body;
        const user=await userModel.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        user.remindersEnabled=remindersEnabled;
        await user.save();
        return res.status(200).json({message:"Reminder preference updated",data:user});
    }   
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})
module.exports=router