import express from "express"
import { createReport } from "../controllers/reportController.js"
import { protect } from "../middlewares/authMiddlewares.js"

const router=express.Router();

router.post("/posts/:id/report",protect,createReport);

export default router;
