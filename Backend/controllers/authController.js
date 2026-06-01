import User from "../models/User.js";
import jwt from "jsonwebtoken"
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";


export const registerUser=async (req,res) => {
    try {
        const {username,email,password,confirmPassword}=req.body;
        if(!username || !email || !password || !confirmPassword){
            return res.status(400).json({
                message:"All field are required",
            });
        }

        if(password!==confirmPassword){
            return res.status(400).json({
                message:"Passwords do not match",
            });
        }

        const existingUser=await User.findOne({
            $or:[
                {email},
                {username},
            ]
        });

        if(existingUser){
            return res.status(400).json({
                message:"Email or User already exist",
            });
        }

        const user=await User.create({
            username,
            email,
            password,
        });

        const accessToken=jwt.sign(
            {
                id:user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"15s",
            }
        )

        const refreshToken=jwt.sign(
            {
                id:user._id,
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn:"7d",
            }
        )

        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000,
            }
        );

        res.status(200).json({
            success:true,
            message:"User Registered Successfully",
            accessToken,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
            }
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const loginUser = async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                message:"Email and Password are required",
            });
        }

        const user=await User.findOne({email});

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const isMatch=await user.comparePassword(password);

        if(!isMatch){
            return res.status(400).json({
                message:"Invalid Credentials",
            });
        }

         const accessToken = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15s",
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000,
            }
        );

        res.status(200).json({
            success:true,
            message:"Login Successfully",
            accessToken,
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })

    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

export const refresh=async (req,res) => {
    try {
        const refreshToken=req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({
                success:false,
                message:"Refresh token missing",
            });
        }

        const decoded=jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user=await User.findById(
            decoded.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

         const accessToken = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
            }
        );

        res.status(200).json({
            success: true,
            accessToken,
        });

        
    } catch (error) {
        res.status(401).json({
            success: false,
            message:
                 "Invalid or expired refresh token",
        });
    }
}

export const forgetPassword=async (req,res) => {
    try{ const {email}=req.body;
    if(!email){
        return res.status(400).json({
            message:"Email is required",
        })
    }
    const user=await User.findOne({email});
    if(!user){
      return  res.status(404).json({
            message:"user not found"
        })
    }

    const resetToken=crypto.randomBytes(32).toString("hex");
    const hashToken=crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
    
    user.resetPasswordToken=hashToken;
    user.resetPasswordExpire=Date.now()+10*60*1000;

    await user.save();

    const resetUrl=`http://localhost:5173/reset-password/${resetToken}`;

     const message =
        `Reset your password using this link:\n\n${resetUrl}`;

   await sendEmail(
    user.email,
    "Password reset",
    message
);

    res.status(200).json({
        success:true,
        message:"Reset link send to email",
    });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

export const resetPassword=async (req,res) => {
    try {

        const {password,confirmPassword}=req.body;

        if(!password || !confirmPassword){
            return res.status(400).json({
                message:"password and confirmPassword are required",
            })
        }

        if(password!==confirmPassword){
            return res.status(400).json({
            message: "Passwords do not match"
        });
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
            return res.status(400).json({
                message:"Invalid or expired token",
            });
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
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

