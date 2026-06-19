import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
    },

    reportedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    reason:{
        type:String,
        required:true,
        trim:true,
    },

    status:{
        type:String,
        enum:[
            "pending",
            "reviewed",
            "resolved",
            "rejected",
        ],
        default:"pending",
    },
},
    {
        timestamps:true,
    }
);

reportSchema.index(
    {
        post:1,
        reportedBy:1,
    },
    {
        unique:true,
    }
);

export default mongoose.model("Report",reportSchema);