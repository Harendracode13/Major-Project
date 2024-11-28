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

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber ID");
  }
  const subscribersList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber",
        },
      },
    },
    {
      $project: {
        subscriber: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!subscribersList) {
    throw new ApiError(400, "Error Fetching Subscribers List");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribersList, "Subscribers Fetched Successfully")
    );
});