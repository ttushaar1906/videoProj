import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        index: true  // used for searching
    },
    userEmail: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, 'Password is required !!']
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        // This is payload
        _id: this._id,
        userEmail: this.userEmail,
    },
        process.env.ACCESS_TOKEN_SECRET
    ),{
        expiersIn:process.env.ACCESS_TOKEN_EXPIRY
    }
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        // This is payload
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET
    ),{
        expiersIn:process.env.REFRESH_TOKEN_EXPIRY
    }
 }

export const User = mongoose.model("User", userSchema)