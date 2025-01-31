import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
dotenv.config();

const connectDb=async ()=>{
    try{
        const conn=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
        console.log(`MongoDB connected: ${conn.connection.name}`);
    }catch(error){
        console.log(error);
        throw error;
    }
}

export default connectDb;