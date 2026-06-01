import express from "express"

import {
    registerUser,loginUser,refresh,forgetPassword,resetPassword,
} from "../controllers/authController.js"

import {
    protect
} from "../middlewares/authMiddlewares.js"


const router=express.Router();

router.post("/register",registerUser);

router.post("/login",loginUser);

router.post("/refresh",refresh);

router.post("/forget-password",forgetPassword);

router.post(
    "/reset-password/:token",
    resetPassword
);

router.get(
    "/me",
    protect,
    (req, res) => {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    }
);

export default router;