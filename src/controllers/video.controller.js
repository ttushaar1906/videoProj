import mongoose, { isValidObjectId } from "mongoose"
// import { User } from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import { apiErrorHandler } from "../utils/ApiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { cloudinaryUpload } from "../utils/cloundiary.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new apiErrorHandler(400, "Please fill the required fields")
    }

    const thumbnailLocalPath = req.files?.thumbNail?.[0].path || null

    if (!thumbnailLocalPath) {
        throw new apiErrorHandler(400, "Thumbnail is required !")
    }

    const videoFileLocalPath = req.files.videoFile?.[0].path || null

    if (!videoFileLocalPath) {
        throw new apiErrorHandler(400, "Video is required")
    }

    const thumbNail = await cloudinaryUpload(thumbnailLocalPath)
    const videoFile = await cloudinaryUpload(videoFileLocalPath)

    const result = await Video.create({
        thumbNail:thumbNail.secure_url,
        videoFile:videoFile.secure_url,
        title,
        description,
        owner:req.user._id,
        isPublised:false,
        duration: videoFile.duration
    })

    if (!result) {
        throw new apiErrorHandler(400, "Failed to upload video")
    }
    return res.status(200).json(new apiResponse(200, result, "Video Uploaded"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (isValidObjectId(videoId)) {
        throw new apiErrorHandler(400, "Invalid id")
    }


    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}