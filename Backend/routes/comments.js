import express from "express"

import { getComments,createComment,deleteComments } from "../controllers/commentController.js"

import { protect } from "../middlewares/authMiddlewares.js"

const router=express.Router();
router.get("/post/:postId",getComments)
router.post("/post/:postId",protect,createComment)
router.delete("/:id",protect,deleteComments)

export default router;