import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   
	if(!isValidObjectId(channelId))
	{
		throw new ApiError(400,"channel id is not match")
	}

	const subscribed = await Subscription.findOne({
		$and: [{ channel: channelId }, { subscriber: req.user._id }],
	  });
	  if (!subscribed) {
		const subscribe = await Subscription.create({
		  subscriber: req.user._id,
		  channel: channelId,
		});
		if (!subscribe) {
		  throw new ApiError(500, "Error while Subscribing");
		}
	
		return res
		  .status(200)
		  .json(new ApiResponse(200, subscribe, "Channel Subscribed"));
	  }
	
	  const unsubscribe = await Subscription.findByIdAndDelete(subscribed._id);
	  if (!unsubscribe) {
		throw new ApiError(500, "Error while Unsubscribing");
	  }
	
	  return res.status(200).json(new ApiResponse(200, {}, "Channel Unsubscribed"));
	});
