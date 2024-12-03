import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoid is invaild")
    }

    const user = req.user._id

    const likedvideo = await Like.findOne({
        $and: [{ video: videoId }, { likedBy: user }],
    }
    )

    if (!likedvideo) {
        const like = await Like.create({
            video: videoId,
            likedBy: user
        }
        )
        if (!like) {
            throw new ApiError(500, "liked not add in server")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "Liked Video"
                )
            )
    }

    const unlikedvideo = await Like.findByIdAndDelete(likedvideo._id);

    if (!unlikedvideo) {
        throw new ApiError(500, "serever error while unliked video")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            unlikedvideo,
            "unliked video"
        )
    )

}
)

const toggleCommentLike = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "invaid commentid")
    }

    const user = req.user._id
    const likedcomment = await Like.findOne({

        $and: [{ comment: commentId }, { likedBy: user }]
    }
    )

    if (!likedcomment) {
        const likecomment = await Like.create(
            {
                comment: commentId,
                likedBy: user
            }
        )
        if (!likecomment) {
            throw new ApiError(500, "Detect error at server side")
        }

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    likecomment,
                    "comment like is added"
                )
            )
    }

    const unlikecomment = await Like.findByIdAndDelete(likedcomment._id)

    if (!unlikecomment) {
        new ApiError(500, "error for server side")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                unlikecomment,
                "unlikeing the comment"
            )
        )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalied tweetid")
    }

    const user = req.user._id
    const likedtweet = await Like.findOne({
        $and: [{ tweet: tweetId }, { likedBy: user }]
    })

    if (!likedtweet) {
        const liketweet = await Like.create(
            {
                tweet: tweetId,
                likedBy: user
            }
        )

        if (!likedtweet) {
            throw new ApiError(500, "erroe at serever side")
        }

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    liketweet,
                    "like added successfully"
                )
            )

    }

    const unliketweet = await Like.findByIdAndDelete(likedtweet._id);

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                unliketweet,
                "unliked the tweet"
            )
        )
}
)



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likesvideo = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "owner",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        avatar: 1,
                                        username: 1,
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project:{
                video:1,
                likedBy:1
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likesvideo,
            "fetched all liked Video"
        )
    )
})
export {
    toggleVideoLike,
    toggleCommentLike
}