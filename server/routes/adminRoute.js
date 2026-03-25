const express=require("express");
const router=express.Router();
const adminModel=require("../models/adminModel");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existAdmin = await adminModel.findOne({ email });
    if (!existAdmin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if(password!=existAdmin.password){
        return res.status(400).json({message:"Invalid credentials"});
    }
    // const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });
    return res.status(200).json({ message: "admin login successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports=router;