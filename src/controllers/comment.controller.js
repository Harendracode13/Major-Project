import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
	const { page = 1, limit = 10 } = req.query;
	const video = await Video.findById(videoId);
	if (!video) {
	  throw new ApiError(404, "Video not found");
	}
	const options = {
	  page,
	  limit,
	};
	const comments = await Comment.aggregate([
	  {
		$match: {
		  video: new mongoose.Types.ObjectId(videoId),
		},
	  },
	  {
		$lookup: {
		  from: "users",
		  localField: "owner",
		  foreignField: "_id",
		  as: "createdBy",
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
		  createdBy: {
			$first: "$createdBy",
		  },
		},
	  },
	  {
		$unwind: "$createdBy",
	  },
	  {
		$project: {
		  content: 1,
		  createdBy: 1,
		},
	  },
	  {
		$skip: (page - 1) * limit,
	  },
	  {
		$limit: parseInt(limit),
	  },
	]);
  
	return res
	  .status(200)
	  .json(
		new ApiResponse(
			200, 
			comments, 
			"Comments Fetched"));
})
export{
getVideoComments
}