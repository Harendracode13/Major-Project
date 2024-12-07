import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
          const { content } =req.body

          if(!content)
          {
            throw new ApiError(400,"pleace fill the input filed")
          }

         const tweet= await Tweet.create(
            {
               content,
               owner:req.user._id
            }
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
               tweet,
               "tweet is created"
            )
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId =req.params?.userId

    if(!isValidObjectId(userId))
    {
        throw new ApiError(400,"give valid userid")
    }

  const tweet=  await Tweet.find({
        owner:userId
    })

    if(tweet.length === 0 )
    {
        throw new ApiError(400,"no tweet is avaliable")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {tweet},
            "fecthed tweet successfully"
        )
    )



})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: find tweet through tweet id
    // valided tweet id 
    //take new tweet and update
    
    const content=req.body

    if(!content)
    {
        throw new ApiError(
            400,
            "fill input field"
        )
    }

    const tweet=await Tweet.findById(req.params?.tweetId)

    if(!((tweet?.owner).equals(req.user._id)))
    {
        throw new ApiError(401,"you are not allow to change tweet")
    }

    const updatetweet=await Tweet.findByIdAndUpdate(
       
            tweet._id,
            {
                $set:{
                  content,
                }
            },
            {new:true}
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            newTweet,
            "Updated Tweet"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

     const tweetId=req.params?.tweetId

     if(isValidObjectId(tweetId))
     {
        throw new ApiError(400,"invaild tweet id")
     }

     const tweet=await Tweet.findById(tweetId)

     if(!((tweet?.owner).equals(req.user._id))){
        throw new ApiError(401,"you your not allow delete")
     }

     const response =await Tweet.findByIdAndUpdate(tweet._id)
    
     if(!response)
     {
        throw new ApiError( 400,
            "Error While Deleting the data")
     }
     return res.status(200)
     .json(
        new ApiResponse(
            200,
            {},
            "detele tweet successfully"
        )
     )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}