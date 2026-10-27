import User from "../models/User.js";
import jwt from "jsonwebtoken"
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { issueTokens, signAccessToken, clearRefreshCookie } from "../utils/tokens.js";

const publicUser=(user)=>({
    id:user._id,
    username:user.username,
    email:user.email,
});

export const registerUser=asyncHandler(async (req,res,next) => {
        const {username,email,password,confirmPassword}=req.body;
        if(!username || !email || !password || !confirmPassword){
            return next(new AppError("All field are required",400));
        }

        if(password!==confirmPassword){
            return next(new AppError("Password do not match",400));
        }

        const existingUser=await User.findOne({
            $or:[
                {email:email.toLowerCase().trim()},
                {username},
            ]
        });

        if(existingUser){
            return next(new AppError("Email or username already exists",409))
        }

        const user=await User.create({
            username,
            email,
            password,
        });

        const accessToken=issueTokens(res,user._id);

        res.status(201).json({
            success:true,
            message:"User Registered Successfully",
            accessToken,
            user:publicUser(user),
        })
})

export const loginUser = asyncHandler(async(req,res,next)=>{
        const {email,password}=req.body;
        if(!email || !password){
            return next(new AppError("Email and Password are required",400));
        }

        const user=await User.findOne({email:email.toLowerCase().trim()});

        if(!user || !(await user.comparePassword(password))){
            return next(new AppError("Invalid email or password",400));
        }

        const accessToken=issueTokens(res,user._id);

        res.status(200).json({
            success:true,
            message:"Login Successfully",
            accessToken,
            user:publicUser(user),
        })
})

export const refresh=asyncHandler(async (req,res,next) => {
        const refreshToken=req.cookies?.refreshToken;

        if(!refreshToken){
            return next(new AppError("Refresh token missing",401,"REFRESH_MISSING"));
        }

        let decoded;
        try {
            decoded=jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            clearRefreshCookie(res);
            const expired=error.name==="TokenExpiredError";
            return next(new AppError(
                expired ? "Session expired, please sign in again" : "Invalid refresh token",
                401,
                expired ? "REFRESH_EXPIRED" : "REFRESH_INVALID"
            ));
        }

        const user=await User.findById(decoded.id);

        if (!user) {
            clearRefreshCookie(res);
            return next(new AppError("User no longer exists",401,"USER_NOT_FOUND"));
        }

        res.status(200).json({
            success: true,
            accessToken:signAccessToken(user._id),
            user:publicUser(user),
        });
    })

export const logoutUser=(req,res)=>{
    clearRefreshCookie(res);
    res.status(200).json({
        success:true,
        message:"Logged out",
    });
};

export const forgetPassword=asyncHandler(async (req,res,next) => {
   const {email}=req.body;
    if(!email){
        return next(new AppError("Email is required",400));
    }
    const user=await User.findOne({email:email.toLowerCase().trim()});
    if(!user){
        return next(new AppError("user not found",404));
    }

    const resetToken=crypto.randomBytes(32).toString("hex");
    const hashToken=crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
    
    user.resetPasswordToken=hashToken;
    user.resetPasswordExpire=Date.now()+10*60*1000;

    await user.save();

    const resetUrl=`${process.env.CLIENT_URL}/reset-password/${resetToken}`;

     const message =
        `Reset your password using this link:\n\n${resetUrl}`;

    try {
        await sendEmail(
            user.email,
            "Password reset",
            message
        );
    } catch (error) {
        user.resetPasswordToken=null;
        user.resetPasswordExpire=null;
        await user.save();
        console.error("Reset email failed:",error.message);
        return next(new AppError("Could not send reset email, try again later",500));
    }

    res.status(200).json({
        success:true,
        message:"Reset link send to email",
    });
})

export const resetPassword=asyncHandler(async (req,res,next) => {
        const {password,confirmPassword}=req.body;

        if(!password || !confirmPassword){
            return next(new AppError("password and confirmPassword are required",400));
        }

        if(password!==confirmPassword){
            return next(new AppError("Password does not match",400));
        }

        const token=req.params.token;

        const hashedToken=crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");
        
        const user=await User.findOne({
            resetPasswordToken:hashedToken,
            resetPasswordExpire:{$gt:Date.now()}
        });

        if(!user){
            return next(new AppError("Invalid or expired token",400));
        }

        user.password=password;

        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Password reset successful",
        });
})
