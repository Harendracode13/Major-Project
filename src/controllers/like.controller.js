import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"videoid is invaild")
    }

    const user=req.user._id

    const likedvideo=await Like.findOne({
        $and :[{video:videoId},{likedBy:user}],
    }
    )

    if(!likedvideo)
    {
        throw new ApiError(400,"erroe while likeing the video")
    }
    const like= await Like.create({
        video:videoId,
        likedBy:user
    })

    if(!like)
    {
        throw new ApiError(500,"erroe white adding like")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, like, "User Liked the video")); 
}
)
