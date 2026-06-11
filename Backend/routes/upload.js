import express from "express"
import upload from "../middlewares/upload.js"

import {protect} from "../middlewares/authMiddlewares.js";

import { uploadImages } from "../controllers/uploadController.js";

const router=express.Router();

router.post("/",protect,upload.array("images",5),uploadImages)

export default router;