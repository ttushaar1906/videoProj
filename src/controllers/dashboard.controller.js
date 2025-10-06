import mongoose, { isValidObjectId, Types } from "mongoose";
import { apiErrorHandler } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // count subscribers separately (cheap)
  const totalSubscribers = await Subscription.countDocuments({ channel: userId });

  const stats = await Video.aggregate([
    { $match: { videoOwner: userId } },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: { $ifNull: ["$views", 0] } },
        videoIds: { $push: "$_id" }
      }
    },
    // lookup likes by videoIds
    {
      $lookup: {
        from: "likes",
        let: { vids: "$videoIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$video", "$$vids"] } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: "likes"
      }
    },
    // lookup comments by videoIds
    {
      $lookup: {
        from: "comments",
        let: { vids: "$videoIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$video", "$$vids"] } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: "comments"
      }
    },
    {
      $addFields: {
        totalLikes: { $ifNull: [{ $arrayElemAt: ["$likes.count", 0] }, 0] },
        totalComments: { $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0] }
      }
    },
    {
      $project: { _id: 0, videoIds: 0, likes: 0, comments: 0 }
    }
  ]);

  const row = stats[0] || {};
  return res.status(200).json(
    new apiResponse(200, {
      totalSubscribers,
      totalVideos: row.totalVideos || 0,
      totalViews: row.totalViews || 0,
      totalLikes: row.totalLikes || 0,
      totalComments: row.totalComments || 0
    }, "Channel stats fetched")
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;

    const channelVideo = await Video.find({ videoOwner: userId });
    if (!channelVideo) {
        throw new apiErrorHandler(404, "No Video upload");
    }

    return res
        .status(200)
        .json(new apiResponse(200, channelVideo, "List of Videos"));
});

export { getChannelStats, getChannelVideos };
