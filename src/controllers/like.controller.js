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

    if(!likedvideo){
       const like =await Like.create({
        video:videoId,
        likedBy:user
       }
    )
      if(!like)
      {
        throw new ApiError(500,"liked not add in server")
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
    
    const unlikedvideo=await Like.findByIdAndDelete(likedvideo._id);

    if(!unlikedvideo)
    {
        throw new ApiError(500,"serever error while unliked video")
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

const toggleCommentLike=asyncHandler(async(req,res)=>{

    const { commentId }=req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invaid commentid")
    }

     const user=req.user._id
    const likedcomment= await Like.findOne({

            $and:[{comment:commentId},{likedBy:user}]
        }
    )

    if(!likedcomment)
    {
        const likecomment=await Like.create(
            {
                comment:commentId,
                likedBy:user
            }
        )
        if(!likecomment)
        {
            throw new ApiError(500,"Detect error at server side")
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

    const unlikecomment=await Like.findByIdAndDelete(likedcomment._id)

    if(!unlikecomment)
    {
        new ApiError(500,"error for server side")
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

export{
    toggleVideoLike,
    toggleCommentLike
}