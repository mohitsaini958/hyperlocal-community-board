import Notification from "../models/Notifications.js";

export const getNotifications=async (req,res) => {
    try {
        const notifications=await Notification.find({recipient:req.user._id,})
                                              .populate("sender","username avatar")
                                              .populate("post","title").sort({createdAt:-1,});
        return res.status(200).json({
            success:true,
            notifications
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const markAllRead=async (req,res) => {
    try {
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
    } catch (error) {
       return res.status(500).json({
        success:false,
        message:error.message,
       });
    }
}