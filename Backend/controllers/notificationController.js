import Notification from "../models/Notifications.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getNotifications=asyncHandler(async (req,res) => {
        const notifications=await Notification.find({recipient:req.user._id,})
                                              .populate("sender","username avatar")
                                              .populate("post","title").sort({createdAt:-1,});
        return res.status(200).json({
            success:true,
            notifications
        });
})

export const markAllRead=asyncHandler(async (req,res) => {
        await Notification.updateMany({
            recipient:req.user._id,
            isRead:false,
        },
        {
            $set:{
                isRead:true,
            },
        }
    );

    return res.status(200).json({
        success:true,
        message:"Notifications marked as read",
    });
})