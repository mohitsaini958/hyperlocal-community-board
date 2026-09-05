import streamifier from "streamifier"
import cloudinary from "../config/cloudinary.js"
import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const uploadImages=asyncHandler(async (req,res,next) => {
        if(!req.files || req.files.length===0){
            return next(new AppError("No files uploaded",400));
        }

      const uploadPromises =req.files.map((file) =>new Promise(
            (resolve,reject)=> {
                            const uploadStream =
                            cloudinary.uploader.upload_stream(
                                {
                                     folder:
                                    "hyperlocal-posts",
                                },
                                (
                                    error,
                                    result
                                ) => {
                                       if (error){
                                            return reject(error);
                                        }
                                        resolve(result.secure_url);
                                    }
                                );
                            streamifier
                                .createReadStream(file.buffer)
                                .pipe(uploadStream);
                        }
                    )
            );

            const urls=await Promise.all(uploadPromises);
            return res.status(200).json({
                success:true,
                urls,
            });
    })