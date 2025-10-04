import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { cloudinaryUpload } from "../utils/cloundiary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiErrorHandler } from "../utils/apiError.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const matchStage = {};

  // 🔍 Search filter
  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // 👤 Filter by owner
  if (userId) {
    matchStage.videoOwner = new mongoose.Types.ObjectId(userId);
  }

  // 🧠 Aggregation pipeline
  const aggregation = Video.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "videoOwner",
        foreignField: "_id",
        as: "videoOwner",
      },
    },
    { $unwind: "$videoOwner" },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbNail: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        "videoOwner._id": 1,
        "videoOwner.userName": 1,
        "videoOwner.fullName": 1,
        "videoOwner.avatar": 1,
      },
    },
    { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } },
  ]);

  // ⚙️ Use aggregatePaginate
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Video.aggregatePaginate(aggregation, options);

  return res
    .status(200)
    .json(new apiResponse(200, result, "List of videos fetched successfully!"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new apiErrorHandler(400, "Please fill the required fields");
  }

  const thumbnailLocalPath = req.files?.thumbNail?.[0].path || null;

  if (!thumbnailLocalPath) {
    throw new apiErrorHandler(400, "Thumbnail is required !");
  }

  const videoFileLocalPath = req.files.videoFile?.[0].path || null;

  if (!videoFileLocalPath) {
    throw new apiErrorHandler(400, "Video is required");
  }

  const thumbNail = await cloudinaryUpload(thumbnailLocalPath);
  const videoFile = await cloudinaryUpload(videoFileLocalPath);

  const result = await Video.create({
    thumbNail: thumbNail.secure_url,
    videoFile: videoFile.secure_url,
    title,
    description,
    videoOwner: req.user._id,
    isPublised: false,
    duration: videoFile.duration,
  });

  if (!result) {
    throw new apiErrorHandler(400, "Failed to upload video");
  }
  return res.status(200).json(new apiResponse(200, result, "Video Uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id

  const { videoId } = req.params;

  if (!videoId) {
    throw new apiErrorHandler(400, "Id is required");
  }

  if (!isValidObjectId(req.params.videoId)) {
    throw new apiErrorHandler(400, "Invalid id");
  }

  const result = await Video.findById({ _id: videoId }).populate(
    "videoOwner",
    "userName avatar fullname"
  );
  if (!result) {
    throw new apiErrorHandler(400, "Video not found!!");
  }
  console.log(result);

  res
    .status(200)
    .json(new apiResponse(200, result, "Video fetched successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //TODO: update video details like title, description, thumbnail

  if (!videoId) {
    throw new apiErrorHandler(400, "Id is required");
  }

  if (!isValidObjectId(req.params.videoId)) {
    throw new apiErrorHandler(400, "Invalid id");
  }

  const fieldsToUpdate = ["title", "description"];
  const updatedData = {};
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      updatedData[field] = req.body[field];
    }
  });

  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    const newThumbNail = await cloudinaryUpload(thumbnailLocalPath);
    updatedData.thumbNail = newThumbNail.url;
  }

  const result = await Video.findByIdAndUpdate(
    {
      _id: videoId,
    },
    updatedData,
    { new: true }
  );
  return res
    .status(200)
    .json(new apiResponse(200, result, "Video Updated Successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new apiErrorHandler(400, "Id is required");
  }

  if (!isValidObjectId(req.params.videoId)) {
    throw new apiErrorHandler(400, "Invalid id");
  }

  const result = await Video.findByIdAndDelete({ _id: videoId });
  if (!result) {
    throw new apiErrorHandler(400, "Video not found!!");
  }
  res.status(200).json(new apiResponse(200, "Video Deleted successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiErrorHandler(400, "Id is required");
  }

  if (!isValidObjectId(req.params.videoId)) {
    throw new apiErrorHandler(400, "Invalid id");
  }

  const result = await Video.findByIdAndUpdate(
    { _id: videoId },
    { $set: { isPublised: true } },
    { new: true }
  );
  if (!result) {
    throw new apiErrorHandler(400, "Video not found!!");
  }
  res
    .status(200)
    .json(new apiResponse(200, result, "Video fetched successfully!"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
