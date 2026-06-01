import User from "../models/User.js"

export const updateLocation=async (req,res) => {
    try {
        const {latitude,longitude,neighborhood,}=req.body;

        if(latitude===undefined || longitude===undefined){
            return res.status(400).json({
                success:false,
                message:"Latitude and Longitude are required",
            });
        }

        if (
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid latitude",
            });
        }

        if (
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid longitude",
            });
        }

        const user=await User.findById(req.user._id);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
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

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}