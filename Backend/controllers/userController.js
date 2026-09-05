import User from "../models/User.js"
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const updateLocation=asyncHandler(async (req,res,next) => {
        const {latitude,longitude,neighborhood,}=req.body;

        if(latitude===undefined || longitude===undefined){
            return next(new AppError("Latitude and Longitude are required",400));
        }

        if (
            latitude < -90 ||
            latitude > 90
        ) {
            return next(new AppError("Invalid latitude",400));
        }

        if (
            longitude < -180 ||
            longitude > 180
        ) {
            return next(new AppError("Invalid longitude",400));
        }

        const user=await User.findById(req.user._id);

        if(!user){
            return next(new AppError("User not found",404));
        }

        user.location={
            type:"Point",
            coordinates:[
                Number(longitude),
                Number(latitude),
            ],
        };

        if(neighborhood){
            user.neighborhood=neighborhood;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Location updated successfully",

            location: user.location,

            neighborhood:
                user.neighborhood,
        });

    })