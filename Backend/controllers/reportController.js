import Report from "../models/Report.js";
import Post from "../models/Post.js";

export const createReport=async (req,res) => {
    try {
        const {id}=req.params;
        const {reason}=req.body;
        if(!reason){
            return res.status(400).json({
                success:false,
                message:"Reason is required",
            });
        }

        const post=await Post.findById(id);
        if(!post){
            return res.status(401).json({
                success:false,
                message:"Post not found",
            });
        }

        const existingReport = await Report.findOne({
            post:id,
            reportedBy:req.user._id,
        });

        if(existingReport){
            return res.status(400).json({
                success:false,
                message:"You have already reported this post",
            });
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

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};