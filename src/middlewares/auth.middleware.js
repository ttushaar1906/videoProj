import { User } from "../models/user.model.js";
import { apiErrorHandler } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer", "")
        console.log(`this is token ${token}`);
        
        if (!token) throw new apiErrorHandler(401, "Unauthorization")

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) throw new apiErrorHandler(401, "Invalid Access Token")

        req.user = user;
        next()
    } catch (error) {
        throw new apiErrorHandler(500, error?.message || "Something went wrong !!")
    }
})