import mongoose from "mongoose";
                                              
const postSchema = new mongoose.Schema(       
    {                                         
        author: {                             
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isAnonymous: {
            type: Boolean,
            default: false,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        body: {
            type: String,
            trim: true,
            maxlength: 5000,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Lost",
                "Found",
                "Help",
                "Event",
                "Announcement",
                "Alert",
                "free-stuff",
                "question",
                "general",
                "Other",
            ],
        },

        images: [
            {
                type: String,
            },
        ],

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                required: true,
            },
        },

        radius: {
            type: Number,
            default: 1000,
        },

        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        commentCount: {
            type: Number,
            default: 0,
        },

        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        expiresAt: {
            type: Date,
            default: () =>
                new Date(
                    Date.now() +
                        30 *
                            24 *
                            60 *
                            60 *
                            1000
                ),
        },
    },
    {
        timestamps: true,
    }
);

postSchema.index({
    location: "2dsphere",
});

postSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);

const Post = mongoose.model(
    "Post",
    postSchema
);

export default Post;