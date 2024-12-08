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

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"give valid playlistid")
    }

   const findplaylist= await Playlist.aggregate(
        [
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(playlistId)
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
                                fullname:1,
                                username:1,
                                avatar:1
                            }
                        }
                    ]
                }
            },
            {
            $addFields:{
                createdBy:{
                    $first:"$createBy"
                }
            }
            },
            {
                //videos
                $lookup:{
                    form:"videos",
                    localField:"videos",
                    foreignField:"_id",
                    as:"videos",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner",
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
                                thumbnail:1,
                                title:1,
                                duration:1,
                                views:1,
                                owner:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                },
                                createdAt:1,
                                updatedAt:1
                            }
                        }
                    ]

                }
            },
            {
                $project:{
                    name:1,
                    description:1,
                    videos:1,
                    createdBy:1
                }
            }
        ]
    )

    if(!findplaylist[0])
    {
        throw new ApiError(400,"No such Playlist found")  
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            findplaylist[0],
           "Fetched playlist"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId,videoId }=req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    {
        throw new ApiError(400,"invalid videoid or playlistid")
    }

    const playlist=await Playlist.findById(playlistId);

    if(!playlist)
    {
        throw new ApiError(400,"no playlist found")
    }

    if(!(playlist.owner).equals(req.user?._id)){
        throw new ApiError(
            400,
            "you cannot add video in this playlist"
        )
    }

    if (playlist.videos.some(video => video.toString() === videoId)) {
        throw new ApiError(400, "Video is already in the playlist");
    }
    
    const newVideo = [...(playList.videos),videoId]
    const newPlaylist = await Playlist.findByIdAndUpdate(
        playlist._id,
        {
            $set:{
                videos:newVideo
            }
        },
        {new:true}
    )
    if (!newPlaylist) {
        throw new ApiError(
            500,
            "Error while Adding new video"
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newPlaylist,
            "Video added"
        )
    )
})

const removeVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId }=req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    {
        throw new ApiError(400,"invalid videoid or playlistid")
    }

    const playlist=await Playlist.findById(playlistId);

    if(!playlist)
    {
        throw new ApiError(400,"no playlist found")
    }

    if(!(playlist.owner).equals(req.user?._id)){
        throw new ApiError(
            400,
            "you cannot allow to delete video in this playlist"
        )
    }

    const newplaylistVideo=(playlist.videos).filter(v => v.toString() !== videoId)

    const updatePlaylistVideo = await Playlist.findByIdAndUpdate(
        playlist._id,
        {
            $set:{
                videos:newplaylistVideo
            }
        },
        {
            new:true
        }
    )

    if(!updatePlaylistVideo)
    {
        throw new ApiError(500,"error while removing video from playlist")
    }

    return res
    .status(200)
    .json(
            new ApiResponse(
                200,
                updatePlaylistVideo,
                "removed video successfully"
            )
    )

})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlist}=req.params

    if(!isValidObjectId(playlist))
    {
        throw new ApiError(400,"invalid objectid")
    }

    const findplaylist= await Playlist.findById(playlist)

    if(!findplaylist)
    {
        throw new ApiError(400,"not found playlist")
    }

    if (!((findplaylist.owner).equals(req.user._id)))
    {
        throw new ApiError(400,"you cannot delele video")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(findPlaylist._id)
        if (!deletedPlaylist) {
            throw new ApiError(500,"Error while deleting vod")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedPlaylist,
                "successfully deleted playlist"
            )
        )
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {name, description}=req.body

    if(!(name || description))
    {
        throw new ApiError(400,"give name or description for updation")
    }
 
    if(isValidObjectId(playlistId))
    {
        throw new ApiError(400,"invlid playlistid")
    }

    const findPlaylist = await  Playlist.findById(playlistId)
    if (!findPlaylist) {
        throw new ApiError(
            400,
            "Not found playlist"
        )
    }
    if (!((findPlaylist.owner).equals(req.user?._id))){
        throw new ApiError(
            400,
            "You cannot delete it"
        )
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        findPlaylist._id,
        {
            $set:{
                name,
                description
            }
        },
        {new:true}
    ) 
    if (!updatedPlaylist) {
        throw new ApiError(
            400,
            "Error while updating playlist"
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "values updated"
        )
    )
})

export{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoToPlaylist,
    deletePlaylist,
    updatePlaylist
}