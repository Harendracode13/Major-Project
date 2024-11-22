import { asyncHandler} from "../utils/asyncHandler";
import { Video } from "../models/video.model";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = " ",
        sortBy,
        sortType,
        userId,
      } = req.query;
      //TODO: get all videos based on query, sort, pagination
      const videos = await Video.aggregate([
        {
          $match: {
            $or: [
              {
                title: { $regex: query, $options: "i" },
              },
              {
                description: { $regex: query, $options: "i" },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        {
          $unwind: "$createdBy",
        },
        {
          $project: {
            thumbnail: 1,
            videoFile: 1,
            title: 1,
            description: 1,
            createdBy: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        },
        {
          $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1,
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
    .stusts(200)
    .json(
        new ApiResponse
        (200,video,"Feched Video successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  
  if (!title || !description) {
    throw new ApiError(400, "All Fields are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "No video file found");
  }
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);

  if (!videoFile.url) {
    throw new ApiError(500, "Error while uploading video file");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "No thumbnail file found");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading thumbnail file");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(500, "Error while publishing the video");
  }

  return res.status(200).json(new ApiResponse(200, video, "Video Published"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video=await Video.findById(videoId);

  if(!video)
  {
    throw new ApiError(404,"no video found");
  }

  return res
  .status(200)
  .json(
    200,
    video.url,
    "Fecth video sucessfully"
  )
})