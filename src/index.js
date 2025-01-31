import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
dotenv.config();

const PORT= process.env.PORT || 4000

await connectDb().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    })
}).catch(()=>{
    app.on("error",(err)=>{
        console.log(err);
    })    
})


