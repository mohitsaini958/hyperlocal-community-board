import mongoose from "mongoose";
import Post from "../models/Post.js";
import Notifications from "../models/Notifications.js";
import { getGeoRoom } from "../utils/getGeoRoom.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getNearbyPosts = asyncHandler(async (req, res,next) => {
    const { page = 1, category } = req.query;

    const userLat = req.user.location?.coordinates?.[1];
    const userLng = req.user.location?.coordinates?.[0];

    if (userLat === undefined || userLng === undefined) {
      return next(new AppError("User location not set",400));
    }

    const limit = 20;
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * limit;

    const query = {
      expiresAt: {
        $gt: new Date(),
      },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          $maxDistance: 10000, // 2 km
        },
      },
    };

    if (category) {
      query.category = category;
    }

    const posts = await Post.find(query)
      .populate("author", "username avatar reputation")
    //   .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

     const total = posts.length;

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      posts,
    });
})

export const createPost=asyncHandler(async (req,res,next) => {
        const {title,body,category,images=[],tags=[],latitude,longitude,radius,isAnonymous}=req.body;
        if(!title||!category){
            return next(new AppError("Title and category are required",400));
        }
        if(latitude===undefined || longitude===undefined){
            return next(new AppError("Location is required",400));
        }

        const post=await Post.create({
            author:req.user._id,
            isAnonymous:isAnonymous||false,
            title,
            body,
            category,
            images,
            tags,
            radius:radius || 5000,
            location:{
                type:"Point",
                coordinates:[
                    Number(
                        longitude
                    ),
                    Number(
                        latitude
                    ),
                ],
            },
        });

        const populatePost=await Post.findById(
            post._id
        ).populate(
            "author",
            "username avatar reputation"
        );

        const io = req.app.get("io");

        const roomId = getGeoRoom(
            Number(latitude),
            Number(longitude)
        );

        io.to(roomId).emit(
            "new_post",
            populatePost
        );

        return res.status(201).json({
            success:true,
            message:"Post created successfully",
            post:populatePost,
        });
})

export const getPost=asyncHandler(async (req,res,next) => {
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return next(new AppError("Invalid post id",400));
        }

        const post=await Post.findById(id).populate("author","username avatar reputation");
        if(!post){
            return next(new AppError("Post not found",400));
        }

        res.status(200).json({
            success:true,
            post,
        });
})

export const deletePost=asyncHandler(async (req,res,next) => {
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return next(new AppError("Invalid post id",400));
        }

        const post=await Post.findById(id);

        if(!post){
            return next(new AppError("Post not found",400));
        }

        if(post.author.toString() !== req.user._id.toString()){
            return next(new AppError("Not authorised to delete this post",403));
        }

        await post.deleteOne();
        const io = req.app.get("io");
        
        const room = getGeoRoom(
            Number(post.location.coordinates[1]), // latitude
            Number(post.location.coordinates[0])  // longitude
        );

        io.to(room).emit("post_deleted", {
            postId: post._id,
        });

        res.status(200).json(
            {
                success:true,
                message:"Post deleted successfully",
            }
        );
})

export const toggleVote=asyncHandler(async (req,res,next) => {
        const {id}=req.params;
        const userId=req.user._id;
        const post=await Post.findById(id);
        if(!post){
            return next(new AppError("Post not found",404));
        }

        const alreadyVoted=post.upvotes.some((vote)=>vote.toString()===userId.toString());
        let action;
        const io=req.app.get("io");
        if(alreadyVoted){
            post.upvotes=post.upvotes.filter((vote)=>vote.toString()!==userId.toString());
            action="removed";
        }
        else{
            post.upvotes.push(userId);
            action="added";
            if(post.author.toString!==userId.toString()){
             const notification=await Notifications.create({
                    recipient:post.author,
                    sender:userId,
                    post:post._id,
                    type:"upvote",
                });
                io.to(`user_${post.author}`).emit("notification",notification);
            }
        }
        await post.save();
        
        io.emit("vote_update",{
            postId:post._id,
            voteCount:post.upvotes.length,
        });

        return res.status(200).json({
            success:true,
            action,
            voteCount:post.upvotes.length,
        });
    })

