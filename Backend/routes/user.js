import express from "express"

import {updateLocation} from "../controllers/userController.js"

import { protect } from "../middlewares/authMiddlewares.js"

const router=express.Router();

router.put("/location",protect,updateLocation);

export default router;