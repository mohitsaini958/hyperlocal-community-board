import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notifications from "../models/Notifications.js";

export const getComments=async (req,res) => {
    try {
        const {postId}=req.params;
        const comments=await Comment.find({
            post:postId,
        })
        .populate("author","username avatar reputation")
        .sort({createdAt:-1,});

        return res.status(200).json({
            success:true,
            comments,
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const createComment=async (req,res) => {
    try {
        const {postId}=req.params;
        const {body,isAnonymous=false,parentComment=null,}=req.body;
        if(!body){
            return res.status(400).json({
                success:false,
                message:"Comment body is required",
            });
        }

        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found",
            });
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
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const deleteComments=async (req,res) => {
    try {
        const {id}=req.params;
        const comment=await Comment.findById(id);
        if(!comment){
            return res.staus(404).json({
                success:false,
                message:"Comment not found",
            });
        }
        if(comment.author._id.toString()!==req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message:"Not authorized",
            });
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

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};