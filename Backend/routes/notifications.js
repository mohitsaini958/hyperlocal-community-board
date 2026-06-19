import express from "express"

import { getNotifications,markAllRead } from "../controllers/notificationController.js"
import { protect } from "../middlewares/authMiddlewares.js"

const router=express.Router();

router.get("/",protect,getNotifications);
router.put("/read-all",protect,markAllRead);

export default router;