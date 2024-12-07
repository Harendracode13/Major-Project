import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!((name)&&(description)))
    {
        throw new ApiError(400,"name and description is requried")
    }

    const newPlaylist=await Playlist.create(
        {
        name,
        description,
        owner:req.user?._id
        }
    )

    if(!newPlaylist)
    {
        throw new ApiError(500,"error while creating the playlist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newPlaylist,
            "Playlist created"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId))
    {
        throw new ApiError(400,"invaild userid")
    }

    const findplaylist=await Playlist.aggregate(
        [
            {
                $match:{
                     owner:new mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"videos",
                    foreignField:"_id",
                    as:"videos",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner"
                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                $first:"$owner"
                                }
                            }
                        },
                        {
                            $project:{
                                title:1,
                                description:1,
                                thumbnail:1,
                                owner:{
                                    username: 1,
                                    fullName: 1,
                                    avatar: 1,
                                }
                            }
                        }
                    ]
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"createdBy",
                    pipeline:[
                        {
                            $project:{
                                avatar:1,
                                fullName:1,
                                username:1
                            }
                        }
                ]
                }
            },
            {
                    $addFields:{
                        createdBy:{
                            $first:"$createdBy"
                        }
                    }
            },
            {
                $project:{
                    videos  :1,
                    createdBy:1,
                    name:1,
                    description:1
                }
            }
        ]
    )
    if (!findplaylist) {
        throw new ApiError(
            500,
            "No such playlist found"
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            findplaylist,
            "Got playlist"
        )
    )
})