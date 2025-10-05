import { isValidObjectId, Types } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { apiErrorHandler } from "../utils/apiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!(name || description)) {
    throw new apiErrorHandler(400, "Please fill all required fields");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    videos: [],
  });

  if (!newPlaylist) {
    throw new apiErrorHandler(400, "Failed to create playlist");
  }
  return res
    .status(200)
    .json(new apiResponse(200, newPlaylist, "Playlist Created !"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new apiErrorHandler(400, "User id is required");
  }

  if (!isValidObjectId(userId)) {
    throw new apiErrorHandler(400, "Invalid user id");
  }

  const userPlaylist = await Playlist.findOne({ owner: userId });

  if (!userPlaylist) {
    throw new apiErrorHandler(404, "User's playlist not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, userPlaylist, "User playlist !!"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new apiErrorHandler(400, "Please provide required params");
  }

  if (!isValidObjectId(playlistId)) {
    throw new apiErrorHandler(400, "Invalid id for playlist");
  }

  const result = await Playlist.findOne({ _id: playlistId })
    .populate("videos", "title _id duration thumbNail description")
    .populate("owner", "avatar userName _id");

  if (!result) {
    throw new apiErrorHandler(400, "Failed to fetch playlist");
  }

  return res.status(200).json(new apiResponse(200, result, "Playlist fetched"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId || videoId)) {
    throw new apiErrorHandler(400, "Please provide required params");
  }

  if (!isValidObjectId(playlistId)) {
    throw new apiErrorHandler(400, "Invalid id for playlist");
  }
  if (!isValidObjectId(videoId)) {
    throw new apiErrorHandler(400, "Invalid id for video Id");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    { _id: playlistId },
    { $push: { videos: videoId } },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new apiErrorHandler(400, "Failed to updated Playlist");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPlaylist, "Playlist updated Suucessfully !!")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!(playlistId || videoId)) {
    throw new apiErrorHandler(400, "Please provide required params");
  }

  if (!isValidObjectId(playlistId)) {
    throw new apiErrorHandler(400, "Invalid id for playlist");
  }
  if (!isValidObjectId(videoId)) {
    throw new apiErrorHandler(400, "Invalid id for video Id");
  }

  const result = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: new Types.ObjectId(videoId) } },
    {
      new: true,
    }
  );


  if (!result) {
    throw new apiErrorHandler(404, "Failed to remove");
  }

  return res.status(200).json(new apiResponse(200,result, "Removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new apiErrorHandler(400, "Please provide required params");
  }

  if (!isValidObjectId(playlistId)) {
    throw new apiErrorHandler(400, "Invalid id for playlist");
  }

  const result = await Playlist.findByIdAndDelete({ _id: playlistId });
  if (!result) {
    throw new apiErrorHandler(400, "Failed to delete playlist");
  }

  return res.status(200).json(new apiResponse(200, "", "Playlist deleted!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId) {
    throw new apiErrorHandler(400, "Please provide required params");
  }

  if (!isValidObjectId(playlistId)) {
    throw new apiErrorHandler(400, "Invalid id for playlist");
  }

  const fieldsToUpdate = ["name", "description"];
  const updatedData = {};

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      updatedData[field] = req.body[field];
    }
  });

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    { _id: playlistId },
    updatedData,
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new apiErrorHandler(400, "Failed to update Playlist");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPlaylist, "Playlist updated successfully ")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
