import { Comment } from "../models/comment.model.js"
import { apiErrorHandler } from "../utils/apiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose, { isValidObjectId } from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params

    if (!videoId) {
        throw new apiErrorHandler(400, "Id is required");
    }

    if (!isValidObjectId(req.params.videoId)) {
        throw new apiErrorHandler(400, "Invalid id");
    }

    const { content } = req.body

    if (!content) {
        throw new apiErrorHandler(400, "Comment Content is required !!")
    }

    const newComment = await Comment.create({
        content,
        owner: req.user?._id,
        video: videoId
    })

    if(!newComment){
        throw new apiErrorHandler(400,"Failed to comment")
    }

    return res.status(200).json(new apiResponse(200,newComment,"Comment Added"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}