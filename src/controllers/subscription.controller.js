import { isValidObjectId, Types } from "mongoose";
import { apiErrorHandler } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { apiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
    // TODO: toggle subscription

    if (!channelId) {
        throw new apiErrorHandler(400, "Channel Id is required");
    }

    if (!isValidObjectId(channelId)) {
        throw new apiErrorHandler(400, "Invalid channel Id");
    }

    const unSubscribe = await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: userId,
    });

    if (unSubscribe) {
        return res
            .status(200)
            .json(new apiResponse(200, "", "Channel Unsubscribed!"));
    } else {
        const subscribe = await Subscription.create({
            channel: channelId,
            subscriber: userId,
        });

        if (!subscribe) {
            throw new apiErrorHandler(400, "Failed to subscribe");
        }

        return res
            .status(200)
            .json(new apiResponse(200, subscribe, "Subscribed Successfully "));
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) {
        throw new apiErrorHandler(400, "Channel Id is required!")
    }
    if (!isValidObjectId(channelId)) {
        throw new apiErrorHandler(400, "Invalid Channel Id")
    }

    const result = await Subscription.find({ channel: channelId }).populate("channel","userName avatar").populate("subscriber", "userName avatar")
    if (!result?.length) {
        throw new apiErrorHandler(400, "No subscriber for this channel")
    }

    return res.status(200).json(new apiResponse(200, result, "subscriber list of a channel"))
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new apiErrorHandler(400, "Subscriber Id Id is required")
    }

    if (!isValidObjectId(subscriberId)) {
        throw new apiErrorHandler(400, "Invalid Id")
    }

    const result = await Subscription.find({ subscriber: new Types.ObjectId(subscriberId) }).populate("channel", "avatar userName")

    if (!result?.length) {
        throw new apiErrorHandler(400, "Failed to fetch records")
    }

    return res.status(200).json(new apiResponse(200, result, "fetched"))
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
