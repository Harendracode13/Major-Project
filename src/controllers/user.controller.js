import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser =asyncHandler(async (req,res)=>{
	    // get data from user
		//check data is empty or not
		//validate user allready exiest or not
		//check image and avatar
		//upload on cloudinary
		//create user and database entry
		//remove password and refresh token from resonse
		//check user creation
		//return response

		const {fullname, email,username,password, }=req.body;
		
		if (
			[fullname, email, username, password].some((field) => field?.trim() === "")
		){
            throw new ApiError(400, "All fields are required")
		}

		const existedUser = await User.findOne({
			$or: [{ username }, { email }]
		})

		if (existedUser) {
			throw new ApiError(409, "User with email or username already exists")
		}

		const avatarLocalPath=req.files?.avatar[0]?.path;
		const coverImageLocalPath=req.files?.coverImage[0]?.path;
		if(!avatarLocalPath){
			throw new ApiError(400,"avatar is requried");
		}

		const avatar=await uploadOnCloudinary(avatarLocalPath);
		const coverImage=await uploadOnCloudinary(coverImageLocalPath);

		if(!avatar){
			throw new ApiError(400,"Avatar is requried")
		}

		const user=await User.create({
			fullname,
			avatar:avatar.url,
			coverImage:coverImage?.url || "",
			email,
			password,
			username:username.toLowerCase()
		})

		const createdUser=await User.findById(user._id).select("-password -refreshToken")

		if(!createdUser){
			throw ApiError(500,"something is wrong in server");
		}

   return res.status(201).json(
	new ApiResponse(200,createdUser,"user register successfully")
   )
	
})

export {registerUser}