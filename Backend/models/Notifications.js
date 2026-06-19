import mongoose from "mongoose";

const notificationSchema=new mongoose.Schema({
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    type:{
        type:String,
        enum:[
            "upvote",
            "comment",
            "reply",
            "system",
        ],
        required:true,
    },
    
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
    },

    isRead:{
        type:Boolean,
        default:false,
    },

    expiresAt:{
        type:Date,
        default:()=>new Date( Date.now()+
                        30*24*60*60*1000),
    },
},
    {
        timestamps:true,
    }
);

notificationSchema.index({
    expiresAt:1,
},{
    expireAfterSeconds:0,
})

export default mongoose.model(
    "Notification",
    notificationSchema
);

