import mongoose from "mongoose";
import Post from "../models/Post.js";

export const getNearbyPosts = async (req, res) => {
  try {
    const { page = 1, category } = req.query;

    const userLat = req.user.location?.coordinates?.[1];
    const userLng = req.user.location?.coordinates?.[0];

    if (userLat === undefined || userLng === undefined) {
      return res.status(400).json({
        success: false,
        message: "User location not set",
      });
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPost=async (req,res) => {
    try {
        const {title,body,category,images=[],tags=[],latitude,longitude,radius,isAnonymous}=req.body;
        if(!title||!category){
            return res.status(400).json({
                success:false,
                message:"Title and category are required",
            });
        }
        if(latitude===undefined || longitude===undefined){
            return res.status(400).json({
                success:false,
                message:"Location is required",
            });
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

        const io=req.app.get("io");
        io.emit("new-post",populatePost);

        return res.status(201).json({
            success:true,
            message:"Post created successfully",
            post:populatePost,
        });
    } catch (error) {
        
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const getPost=async (req,res) => {
    try {
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid post id",
            })
        }

        const post=await Post.findById(id).populate("author","username avatar reputation");
        if(!post){
            return res.status(400).json({
                success:false,
                message:"Post not found",
            });
        }

        res.status(200).json({
            success:true,
            post,
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const deletePost=async (req,res) => {
    try {
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid post id",
            });
        }

        const post=await Post.findById(id);

        if(!post){
            return res.status(400).json({
                success:false,
                message:"Post not found",
            });
        }

        if(post.author.toString() !== req.user._id.toString){
            return res.status(403).json({
                success:false,
                message:"Not authorised to delete this post",
            });
        }

        await post.deleteOne();
        const io=req.app.get("io");
        io.emit("post-deleted",{
            postId:post._id,
        });

        res.status(200).json(
            {
                success:true,
                message:"Post deleted successfully",
            }
        );

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};