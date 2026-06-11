import streamifier from "streamifier"
import cloudinary from "../config/cloudinary.js"

export const uploadImages=async (req,res) => {
    try {
        if(!req.files || req.files.length===0){
            return res.status(400).json({
                success:false,
                message:"No files uploaded",
            });
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
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};