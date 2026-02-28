const mongoose=require("mongoose");
const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/leetStreak");
        console.log("Mongodb connected successfully");
    }
    catch(error){
        console.log("Error in connecting to mongodb");
    }
}
module.exports=connectDB;

