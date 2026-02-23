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

module.exports=router