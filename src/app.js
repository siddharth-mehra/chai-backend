
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import connectdb from "./db/index.js";
import userRouter from "./routes/user.route.js";
dotenv.config();
const PORT= process.env.PORT || 4000


const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:"16kb",
}));

app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}));

app.use(express.static("public"))
app.use(cookieParser());

connectdb();
// routes

// routes declaration
app.use("/api/v1/users",userRouter);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
app.get("/",(req,res)=>{
    res.send("hello world");    
})
export {app}