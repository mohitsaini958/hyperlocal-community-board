import jwt from "jsonwebtoken"
import User from "../models/User.js"

const getBearerToken=(req)=>{
    const header=req.headers.authorization;
    if(header && header.startsWith("Bearer ")){
        return header.split(" ")[1];
    }
    return null;
};

const unauthorized=(res,message,code)=>
    res.status(401).json({success:false,message,code});

export const protect=async (req,res,next) => {
    const token=getBearerToken(req);

    if(!token){
        return unauthorized(res,"Not authorized, no token","NO_TOKEN");
    }

    let decoded;
    try {
        decoded=jwt.verify(token,process.env.JWT_SECRET);
    } catch (error) {
        if(error.name==="TokenExpiredError"){
            return unauthorized(res,"Access token expired","TOKEN_EXPIRED");
        }
        return unauthorized(res,"Invalid access token","TOKEN_INVALID");
    }

    try {
        req.user=await User.findById(decoded.id).select("-password");
    } catch (error) {
        return next(error);
    }

    if(!req.user){
        return unauthorized(res,"User no longer exists","USER_NOT_FOUND");
    }
    next();
};


export const optionalAuth=async (req,res,next) => {
    const token=getBearerToken(req);
    req.user=null;

    if(!token){
       return next();
    }

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=await User.findById(decoded.id).select("-password");
    } catch {
        req.user=null;
    }
    next();
}
