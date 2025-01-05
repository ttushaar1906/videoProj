import { asyncHandler } from "../utils/asyncHandler.js"
import { apiErrorHandler } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import {cloudinaryUpload} from "../utils/cloundiary.js"
import {apiResponse} from "../utils/apiResponse.js" 

const userRegistration = asyncHandler(async (req, res) => {
    const { userName, userEmail, fullName, password } = req.body;
    if (
        [userName, userEmail, fullName, password].some((fields) => fields?.trim() === "")
    ) {
        throw new apiErrorHandler(400, "All Fields are required !!"); // Check for function name
    }

    if (!userEmail.includes('@')) {
        throw new apiErrorHandler(404, "Invalid email format !!")
    }

    const existingUser = User.findOne({
        $or: [{ userEmail }, { userName }]
    })

    if(existingUser){
        throw new apiErrorHandler(409, "User email or user name already exists !!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0].path

    if(!avatarLocalPath){
        throw new apiErrorHandler(400,"Avatar Image is required !!")
    }

    const avatar = await cloudinaryUpload(avatarLocalPath)
    const coverImage = await cloudinaryUpload(coverImageLocalPath)

    if(!avatar){
        throw new apiErrorHandler(400,"Avatar Image is required !!")
    }

    const user = await User.create({
        fullName,
        userEmail,
        userName : userName.toLowercase(),
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new apiErrorHandler(500, "Something went wrong while creating the user")
    }

    return res.status(201).json(
        new apiResponse(200,createdUser,"User created successfully !!")
    )
})

export { userRegistration }