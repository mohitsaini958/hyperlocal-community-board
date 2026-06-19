import { getPost,deletePost,getNearbyPosts,createPost,toggleVote } from "../controllers/postController.js";
import express from "express"
import { protect,optionalAuth } from "../middlewares/authMiddlewares.js";
import postLimiter from "../middlewares/postLimiter.js";

const router=express.Router();

router.get("/nearby",optionalAuth,getNearbyPosts)
router.post("/",protect,postLimiter,createPost)
router.get("/:id",getPost);
router.delete("/:id",protect,deletePost);
router.post("/:id/vote",protect,toggleVote);

export default router;