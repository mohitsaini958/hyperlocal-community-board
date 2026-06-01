import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        avatar: {
            type: String,
            default: "",
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                required: true,
                default: [0, 0],
            },
        },

        neighborhood: {
            type: String,
            default: "",
        },

        reputation: {
            type: Number,
            default: 0,
        },

        isAnonymousDefault: {
            type: Boolean,
            default: false,
        },

        resetPasswordToken: {
            type: String,
            default: null,
        },

        resetPasswordExpire: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


userSchema.index({ location: "2dsphere" });


userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(
        this.password,
        10
    );
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(
        enteredPassword,
        this.password
    );
};

const User = mongoose.model("User", userSchema);

export default User;