import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect=async (req,res,next) => {
    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token=req.headers.authorization.split(" ")[1];
        }

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Not authorized, no token",
            })
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        req.user=await User.findById(decoded.id).select("-password");

        if(!req.user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        next();
    } catch (error) {
         if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Access token expired",
            });
        }

        return res.status(401).json({
            success: false,
            message:
                "Invalid access token",
        });
    }
};


export const optionalAuth=async (req,res,next) => {
    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token=req.headers.authorization.split(" ")[1];
        }

        if(!token){
           req.user=null;
           return next();
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        req.user=await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        req.user=null;
        next();
    }
}