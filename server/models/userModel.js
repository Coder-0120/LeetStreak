const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true   
    },
    password:{
        type:String,
        required:true
    },
    leetcodeUsername:{
        type:String,
        required:true 
    },
     //  Track when reminder was last sent
    lastReminderSent: {
      type: Date,
      default: null,
    },

    //  Allow user to enable/disable reminders
    remindersEnabled: {
      type: Boolean,
      default: true,
    },
},{
    timestamps:true 
})
module.exports=mongoose.model("user",userSchema);