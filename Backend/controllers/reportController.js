import Report from "../models/Report.js";
import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const createReport=asyncHandler(async (req,res,next) => {
        const {id}=req.params;
        const {reason}=req.body;
        if(!reason){
            return next(new AppError("Reason is required",400));
        }

        const post=await Post.findById(id);
        if(!post){
            return next(new AppError("Post not found",401));
        }

        const existingReport = await Report.findOne({
            post:id,
            reportedBy:req.user._id,
        });

        if(existingReport){
            return next(new AppError("You have already reported this post",400));
        }

        const report=await Report.create({
            post:id,
            reportedBy:req.user._id,
            reason,
            status:"pending",
        });

        return res.status(201).json({
            success:true,
            message:"Reported submitted successfully",
            report,
        });
})