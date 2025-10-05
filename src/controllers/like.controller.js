import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiErrorHandler } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on video

  if (!videoId) {
    throw new apiErrorHandler(400, "Video Id is required");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiErrorHandler(400, "Invalid id for video Id");
  }

  const isValid = await Video.findById(videoId);

  if (!isValid) {
    throw new apiErrorHandler(400, "No video with this Id !");
  }
  const deleted = await Like.findOneAndDelete({
    video: videoId,
    likedBy: userId,
  });

  if (deleted) {
    // Like existed → user unliked
    return res.status(200).json(new apiResponse(200, "Video Disliked"));
  } else {
    // No like existed → create new like
    const newLike = await Like.create({ video: videoId, likedBy: userId });
    return res.status(201).json(new apiResponse(200, newLike, "Video Liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user._id;

  if (!commentId) {
    throw new apiErrorHandler(400, "Comment Id is required");
  }

  if (!isValidObjectId(commentId)) {
    throw new apiErrorHandler(400, "Invalid id for video Id");
  }

  const isValid = await Comment.findById(commentId);

  if (!isValid) {
    throw new apiErrorHandler(400, "No Comment with this Id");
  }
  const deleteCommentLike = await Like.findOneAndDelete({
    comment: commentId,
    likedBy: userId,
  });

  if (deleteCommentLike) {
    return res.status(200).json(new apiResponse(200, "", "Comment Disliked"));
  } else {
    const likedComment = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new apiResponse(200, likedComment, "Comment Liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user.id;

  if (!tweetId) {
    throw new apiErrorHandler(400, "Video Id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new apiErrorHandler(400, "Invalid id for video Id");
  }

  const isValidId = await Tweet.findById(tweetId);
  if (!isValidId) {
    throw new apiErrorHandler(400, "No tweet with this Id !!");
  }
  const deleteTweetLike = await Like.findOneAndDelete({
    tweet: tweetId,
    likedBy: userId,
  });

  if (deleteTweetLike) {
    return res.status(200).json(new apiResponse(200, "", "Tweet Disliked "));
  } else {
    const likedTweet = await Like.create({ tweet: tweetId, likedBy: userId });
    if (!likedTweet) {
      throw new apiErrorHandler(400).json(400, "Failed to toggle !!");
    }
    return res
      .status(200)
      .json(new apiResponse(200, likedTweet, "Tweet liked "));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.find({
    video: { $ne: null },
    comment: null,
    tweet: null,
  })
    .populate("video", "title thumbNail _id")
    .populate("likedBy", "userName avatar _id");

  if (!likedVideos) {
    throw new apiErrorHandler(400, "No liked videos found");
  }

  return res.status(200).json(new apiResponse(200, likedVideos, "Fetched!"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
