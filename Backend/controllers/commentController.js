import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notifications from "../models/Notifications.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getComments=asyncHandler(async (req,res,next) => {
        const {postId}=req.params;
        if(!postId){
            return next(new AppError("id is required",400));
        }
        const comments=await Comment.find({
            post:postId,
        })
        .populate("author","username avatar reputation")
        .sort({createdAt:-1,});

        return res.status(200).json({
            success:true,
            comments,
        });
    })

export const createComment=asyncHandler(async (req,res,next) => {
        const {postId}=req.params;
        const {body,isAnonymous=false,parentComment=null,}=req.body;
        if(!body){
            return next(new AppError("Comment body is required",400));
        }

        const post=await Post.findById(postId);
        if(!post){
            return next(new AppError("Post not found",404));
        }

        const comment=await Comment.create({
            post:postId,
            author:req.user._id,
            body,
            isAnonymous,
            parentComment,
        });

       const notification=await Notifications.create({
             recipient: post.author,
             sender: req.user._id,
             post: post._id,
             type: "comment",
        });

        const io =req.app.get("io");

        io.to(
            `user_${post.author}`
        ).emit(
            "notification",
            notification
        );

        await Post.findByIdAndUpdate(
            postId,
            {
                $inc:{
                    commentCount:1,
                },
            }
        );

        const populatedComment=await Comment.findById(comment._id).populate("author","username avatar reputation");


        io.to(
            `post_${postId}`
        ).emit(
            "new_comment",
            populatedComment
        );

        return res.status(201).json({
            success:true,
            message:"Comment created successfully",
            comment:populatedComment,
        });
})

export const deleteComments=asyncHandler(async (req,res,next) => {
        const {id}=req.params;
        const comment=await Comment.findById(id);
        if(!comment){
            return next(new AppError("Comment not found",404));
        }
        if(comment.author._id.toString()!==req.user._id.toString()){
            return next(new AppError("Not authorized",403));
        }

        await Comment.findByIdAndDelete(id);

        await Post.findByIdAndUpdate(
            comment.post,
            {
                $inc:{
                    commentCount:-1,
                },
            }
        );

        const io=req.app.get("io");
        io.emit("comment_deleted",{
            commentId:comment._id,
            postId:comment.post,
        });

        return res.status(200).json({
            success:true,
            message:"Comment deleted successfully",
        });
})