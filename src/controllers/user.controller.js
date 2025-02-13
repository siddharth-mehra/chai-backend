import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError,ApiResponse} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadonCloudinary} from "../utils/cloudinary.js"
import JWT from "jsonwebtoken";

export const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(404,"user not found");
        }
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"something went wrong")
    }
}

export const registerUser=asyncHandler(async(req,res)=>{
    const {username,fullName,email,password}=req.body;
   
    if(!username || !fullName || !email ||!password ){
        throw new ApiError(400,`fields are required`)
    }

    const existingUser=await User.findOne({
        $or:[{email},{username}]
    });
    if(existingUser){
        throw new ApiError(409,"User with email or username")
    }
    
    const avatarPath=req.files?.avatar[0]?.path;
    // const coverPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && 
req.files.coverImage.length > 0){
    coverImageLocalPath=req.files.coverImage;
}
  
    if(!avatarPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const uploadavatar=await uploadonCloudinary(avatarPath);
    console.log(uploadavatar,avatarPath);
    const uploadcoverImage=await uploadonCloudinary(coverPath);
    console.log(uploadcoverImage,coverPath)
    if(!uploadavatar){
        throw new ApiError(400,"Avatar file is not uploaded")
    }
   

    const user=await User.create({
        username,
        fullName,
        avatar:uploadavatar.url,
        coverImage:uploadcoverImage.url || "",
        email:email,
        password
    })

    const successUser=User.findById(user._id).select("-password -refreshToken");

    if(!successUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(new ApiResponse(200,"successfullt created User"))
})

export const loginUser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body;
    // username or email
    if(!username && !email ){
        throw new ApiError(400,"username or email are required")
    }
    // find the user
    const existingUser=await User.findOne({
        $or:[{email},{username}]
    })

    if(!existingUser){
        throw new ApiError(404,"User not found")
    }
    
    // password check
    const isPasswordCorrect=await existingUser.comparePassword(password);
    // access and refresh token
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid User Credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(existingUser._id);
    const loggedInUser=User.findById(existingUser._id).select("-password -refreshToken");

    // send cookie
    const options={
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,"User logged in successfully",{user:loggedInUser,accessToken,refreshToken}));
});

export const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{refreshToken:undefined}
    },{
       new:true 
    }
);

    const options={
        httpOnly:true,
        maxAge:1000*60*60*24*7,
        secure:true,
        sameSite:"none"
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,"User logged out successfully"))
})

export const refreshaccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(400,"refresh token is required")
    }

    try {
        const decodedRefreshToken=JWT.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user=await User.findById(decodedRefreshToken?._id);
    
        if(!user){
            throw new ApiError(404,"User not found")
        } 
    
        if(user.refreshToken!==incomingRefreshToken){
            throw new ApiError(401,"Refresh token is invalid")
        }
    
        const options={
            httpOnly:true,
            secure:true,
        }
    
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id);
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,"Access token refreshed successfully",{accessToken,refreshToken:newRefreshToken}))
    } catch (error) {
        throw new ApiError(401,"Refresh token is invalid");
    }
})


export const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.comparePassword(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Old password is incorrect")
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,"Password changed successfully"))
})

export const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"Current User fetched successfully"));
})

export const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;
    if(!fullName || !email){
        throw new ApiError(400,"fullName and email are required")
    }
    const user=await User.findById(req.user._id);
    user.fullName=fullName;
    user.email=email;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"));
})

export const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarPath=req.files?.avatar[0]?.path;
    if(!avatarPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const user=await User.findById(req.user._id);
    const uploadavatar=await uploadonCloudinary(avatarPath);
    if(!uploadavatar){
        throw new ApiError(400,"Avatar file is not uploaded")
    }
    user.avatar=uploadavatar.url;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"));
})

export const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;

    if(!username?.trim()){
        throw new ApiError(400,"username is required")
    }
    
    const Channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignfield:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localfield:"_id",
                foreignfield:"subscriber",
                as:"subscribeto"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                ChannelsubscribedToCount:{
                    $size:"$subscribeto"
                },
                isSubscribed:{
                    $cond:{
                        if:{
                            $in:[req.user?._id,"$subscribers.subscriber"]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                ChannelsubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!Channel?.length){
        throw new ApiError(404,"channel does not found") 
    }



    return res.status(200)
    .json(new ApiResponse(200,Channel[0],"Channel profile fetched successfully"));
})

export const getwatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
            _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                },
                                
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
            ]
        }}
    ]);

    return res.status(200)
    .json(new ApiResponse(200,user[0]?.watchHistory,"Watch History fetched successfully"))
})

