import express from "express"

import { getNotifications,markAllRead,markOneRead } from "../controllers/notificationController.js"
import { protect } from "../middlewares/authMiddlewares.js"

const router=express.Router();

router.get("/",protect,getNotifications);
router.put("/read-all",protect,markAllRead);
router.put("/:id/read",protect,markOneRead);

export default router;
