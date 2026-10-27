import multer from "multer";

const errorHandler=(err,req,res,next)=>{
    let statusCode=err.statusCode || 500;
    let message=err.message || "Internal Server Error";

    if(err.name==="CastError"){
        statusCode=400;
        message=`Invalid ${err.path}`;
    } else if(err.name==="ValidationError"){
        statusCode=400;
    } else if(err.code===11000){
        statusCode=409;
        message="Duplicate value already exists";
    } else if(err instanceof multer.MulterError || message==="Only images are allowed"){
        statusCode=400;
    }

    if(statusCode>=500){
        console.error(err);
    }

    res.status(statusCode).json({
        success:false,
        message,
        ...(typeof err.code==="string" && {code:err.code}),
    });
};

export default errorHandler;
