import { Comment } from "../models/comment.model.js";
import { apiErrorHandler } from "../utils/apiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new apiErrorHandler(400, "Video Id is Required");
  }

  if (!isValidObjectId(videoId)) {
    throw new apiErrorHandler(400, "Invalid Video Id");
  }

  const isValid = await Video.findById(videoId);

  if (!isValid) {
    throw new apiErrorHandler(400, "No video with this Id !");
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }, // latest comments first
  };

  // Build aggregate
  const aggregate = Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } }, // filter by videoId
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $unwind: "$video",
    },
    {
      $project: {
        content: 1,
        "video.title": 1,
        "owner.userName": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  // Use aggregatePaginate
  const result = await Comment.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new apiResponse(200, result, "Comments Fetched successfully!!"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiErrorHandler(400, "Id is required");
  }

  if (!isValidObjectId(req.params.videoId)) {
    throw new apiErrorHandler(400, "Invalid id");
  }

  const isValid = await Video.findById(videoId);

  if (!isValid) {
    throw new apiErrorHandler(400, "No video with this Id !");
  }

  const { content } = req.body;

  if (!content) {
    throw new apiErrorHandler(400, "Comment Content is required !!");
  }

  const newComment = await Comment.create({
    content,
    owner: req.user?._id,
    video: videoId,
  });

  if (!newComment) {
    throw new apiErrorHandler(400, "Failed to comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, newComment, "Comment Added"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new apiErrorHandler(400, "Comment Id is required !! ");
  }

  if (!isValidObjectId(commentId)) {
    throw new apiErrorHandler(400, "Invalid Comment Id ");
  }

  const isValid = await Comment.findById(commentId);

  if (!isValid) {
    throw new apiErrorHandler(400, "No Comment with this Id");
  }

  const { content } = req.body;

  if (!content) {
    throw new apiErrorHandler(400, "Content is required !!");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    { _id: commentId },
    { content },
    { new: true }
  );

  if (!updatedComment) {
    throw new apiErrorHandler(400, "Failed to update comment");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedComment, "Comment Updated successfully !!")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new apiErrorHandler(400, "Comment Id is required");
  }

  if (!isValidObjectId(req.params.commentId)) {
    throw new apiErrorHandler(400, "Invalid id");
  }

  const isValid = await Comment.findById(commentId);

  if (!isValid) {
    throw new apiErrorHandler(400, "No Comment with this Id");
  }

  const result = await Comment.findByIdAndDelete({ _id: commentId });
  if (!result) {
    throw new apiErrorHandler(400, "Failed to delete comment!");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "", "Comment Deleted successfully! "));
});

export { getVideoComments, addComment, updateComment, deleteComment };
