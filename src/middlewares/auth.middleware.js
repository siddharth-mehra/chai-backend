import { ApiError} from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const authMiddleware=asyncHandler(async(req,_,next)=>{
   try {
     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
 
     if(!token){
         throw new ApiError(401,"Unauthorized");
     }
 
     const user=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     
     const successUser=await User.findById(user?._id).select("-password -refreshToken");
 
     if(!successUser){
         throw new ApiError(401,"Unauthorized");
     }
 
     req.user=successUser;
     next();
   } catch (error) {
     throw new ApiError(401,error?.message || "Unauthorized");
   }
})