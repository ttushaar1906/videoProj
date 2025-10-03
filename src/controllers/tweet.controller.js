import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { apiErrorHandler } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content) {
        throw new apiErrorHandler(400, "Content is required!!")
    }

    const result = await Tweet.create({
        owner: req.user._id,
        content
    })

    if (!result) {
        throw new apiErrorHandler(400, "Failed to create a tweet")
    }

    res.status(200).json(new apiResponse(200, result, "Tweet Created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new apiErrorHandler(400, "Invalid Id format !")
    }

    const result = await Tweet.find({ owner: userId })

    if (!result?.length) {
        throw new apiErrorHandler(404, "Tweets not found")
    }
    res.status(200).json(new apiResponse(200, result, "Tweets Fetched "))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new apiErrorHandler(400, "Invalid Id format !")
    }

    if (!content) {
        throw new apiErrorHandler(400, "Content is required")
    }

    const updatedTweet = await Tweet.findOneAndUpdate({ _id: tweetId }, {
        $set: { content }
    }, { new: true })

    res.status(200).json(new apiResponse(200, updatedTweet, "Tweet Updated"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new apiErrorHandler(400, "Invalid Id format !")
    }

    const result = await Tweet.findOneAndDelete({ _id: tweetId })

    if (!result) {
        throw new apiErrorHandler(400, "Failed to delete")
    }
    return res.status(200).json(new apiResponse(200, "Tweet Deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}