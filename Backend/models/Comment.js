import mongoose from "mongoose";

const commentSchema=new mongoose.Schema({
    post:{
        type:mongoose.Schema.ObjectId,
        ref:"Post",
        required:true,
    },
    author:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    isAnonymous:{
        type:Boolean,
        default:false,
    },
    body:{
        type:String,
        required:true,
        trim:true,
        maxlength:1000,
    },
    parentComment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        default:null,
    },
    upvotes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
    ],
},
    {
        timestamps:true,
    }
);

export default mongoose.model(
    "Comment",
    commentSchema
);

