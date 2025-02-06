import { asyncHandler } from "../utils/asyncHandler.js"
import { apiErrorHandler } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { cloudinaryUpload } from "../utils/cloundiary.js"
import { apiResponse } from "../utils/apiResponse.js"

const generateAccessTokenRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken        
        await user.save({ ValidateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        console.log(error);
        throw new apiErrorHandler(500, "Something went wrong !!")
    }
}

const userRegistration = asyncHandler(async (req, res) => {

    const { userName, userEmail, fullName, password } = req.body;
    // Here it will log details of userName, userEmailm fullName and password 

    if (
        [userName, userEmail, fullName, password].some((fields) => fields?.trim() === "")
    ) {
        throw new apiErrorHandler(400, "All Fields are required !!"); // Check for function name
    }

    if (!userEmail.includes('@')) {
        throw new apiErrorHandler(404, "Invalid email format !!")
    }

    const existingUser = await User.findOne({
        $or: [{ userEmail }, { userName }]
    })

    if (existingUser) {
        throw new apiErrorHandler(409, "User email or user name already exists !!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path || null
    // req.files logs the info of the file here it will display fileName, size, original Name etc with [Object: null prototype] 
    // const coverImageLocalPath = req.files?.coverImage[0].path

    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new apiErrorHandler(400, "Avatar Image is required !!")
    }

    const avatar = await cloudinaryUpload(avatarLocalPath)
    const coverImage = await cloudinaryUpload(coverImageLocalPath)

    if (!avatar) {
        throw new apiErrorHandler(400, "Avatar Image is required !!")
    }

    const user = await User.create({
        fullName,
        userEmail,
        userName: userName.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new apiErrorHandler(500, "Something went wrong while creating the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User created successfully !!")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const { userEmail, userName, password } = req.body

    if (!(userEmail || userName)) return res.status(400).json(new apiErrorHandler(400, "Enter username or user email !!"))

    const user = await User.findOne({
        $or: [{ userEmail }, { userName }]
    })
    if (!user) return res.status(404).json(new apiErrorHandler(404, "User not found !!"))
    
    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) return res.status(401).json(new apiErrorHandler(401, "Incorrect Password !!"))

    const loggedInUser = await User.findById(user._id).select("-password -refreshToekn")
    
    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id)

    // This is used to set cookies only from backend 
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToekn", refreshToken, options)
        .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In"))
})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new apiResponse(200,{},"Logged out successfully !!"))
})
export { userRegistration, loginUser, logoutUser }