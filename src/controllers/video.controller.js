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