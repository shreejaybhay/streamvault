import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileURL: {
        type: String
    }
}, { timestamps: true })

export const User = mongoose.models.users || mongoose.model("users", UserSchema);