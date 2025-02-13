import mongoose from "mongoose";

const subscriptionSchema=new mongoose.Schema({
    id:{
        type:String,
        required:true,
        unique:true
    },
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true}) 


export const Subscription=mongoose.model("Subscription",subscriptionSchema);