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