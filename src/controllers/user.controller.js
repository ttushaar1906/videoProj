import { asyncHandler } from "../utils/asyncHandler.js"
import { apiErrorHandler } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { cloudinaryUpload } from "../utils/cloundiary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import { subscription } from "../models/subscription.model.js"

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

    const avatarLocalPath = req.files?.avatar?.[0]?.path || null;
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

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id)

    // This is used to set cookies only from backend 
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In"))
})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: ""
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

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new apiResponse(200, {}, "Logged out successfully !!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const inComingAccessToken = req.cookie.refreshAccessToken || req.body.refreshAccessToken

    if (!inComingAccessToken) {
        throw new apiErrorHandler(401, "Authorized request")
    }
    try {
        const deCodedToken = jwt.verify(inComingAccessToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(deCodedToken?._id)

        if (!user) {
            throw new apiErrorHandler(401, "Invalid refresh token")
        }

        if (deCodedToken !== user.refreshAccessToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new apiErrorHandler(401, "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiErrorHandler(400,
            "Incorrect Password"
        )
    }

    user.password = newPassword
    await user.save({ ValidateBeforeSave: false })

    return res.status(200).json(new apiResponse(200, {}, "Password Changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "User fetched successfully !"))
})

const updateUser = asyncHandler(async (req, res) => {
    const { fullName, userEmail } = req.body

    if (!fullName || !userEmail) {
        throw new apiErrorHandler(400, "Please fill all required fields")
    }

    User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            fullName,
            userEmail
        }
    }, {
        new: true
    }).select("-password")

    return res.status(200).json(new apiResponse(200, user, "User updated successfully !"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const localAvatarPath = req.file?.path

    if (!localAvatarPath) {
        throw new apiErrorHandler(400, "Avatar is missing")
    }

    const avatar = await cloudinaryUpload(localAvatarPath)

    if (!avatar.url) {
        throw new apiErrorHandler(400, "Failed to upload image on cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    },
        {
            new: true
        }).select("-password")

    return res.status(200).json(new apiResponse(200, user, "Avatar Updated Successfully !!"))
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params

    if (!userName) {
        throw new apiErrorHandler(400, "User name not found !!")
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.trim()
            }
        }, {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscripters"
            }
        }, {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        }, {
            $addFields: {
                subscriptersCount: {
                    $size: "$subscripters"
                },
                channelSubscribedTo: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "subscripters:subscripter"] },
                        then: true,
                        else: false
                    }
                }
            }
        }, {
            $project: {
                fullName: 1,
                userName: 1,
                userEmail: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                subscriptersCount: 1,
                channelSubscribedTo: 1
            }
        }
    ])


    if (!channel?.length) {
        throw new apiErrorHandler(400, "Channel Does not exists")
    }

    return res.status(200).json(new apiResponse(200, channel[0], "Channel fetched successfully"))

})

export { userRegistration, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUser, updateAvatar ,getUserChannelProfile}