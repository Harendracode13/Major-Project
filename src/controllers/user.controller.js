import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

      const generateAccessAndRefreshToken=async(userId)=>{
          try{
			const user=await User.findById(userId)
		const accessToken=user.generateAccessToken()
		const refreshToken=user.generateAccessToken()

		user.refreshToken=refreshToken
		await user.save({validateBeforeSave:false})

	    return {accessToken,refreshToken}

		  }catch(error){
			throw new ApiError(500,"something went wrong while generating access token and refresh token")
		  }
	  }
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
		//const coverImageLocalPath=req.files?.coverImage[0]?.path;
           
		let coverImageLocalPath;
		if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
			coverImageLocalPath = req.files.coverImage[0].path
		}
		
		if(!avatarLocalPath){
			throw new ApiError(400,"avatar is requried");
		}

		const avatar=await uploadOnCloudinary(avatarLocalPath);
		const coverImage=await uploadOnCloudinary(coverImageLocalPath);
      //console.log(avatar);
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

const loginUser=asyncHandler(async(req,res)=>{
	//req body data
	//username or email
	//fond the user
	//pasword check
	//generate access token or refresh token
    // send cookie

	const {email,username,password}=req.body

	if(!username && !email){
		throw new ApiError(400,"username or email is requried")
	}
	const user=await User.findOne({
		$or:[{username},{email}]
	})

	if(!user){
		throw new ApiError(400,"user not found")
	}

   const isPasswordValid=await user.isPasswordCorrect(password)

   if(!isPasswordValid){
	throw new ApiError(401,"password is invalid")
   }

   const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

   const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

   const options={
	httpOnly:true,
	secure:true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
	new ApiResponse(200,
		{
		user:loggedInUser,accessToken,refreshToken
	    },
		"user logged in successfully"
)
   )

})

const logoutUser =asyncHandler(async(req,res)=>{
       await User.findOneAndUpdate(
			req.user._id,
			{
				$set:{
					refreshToken:undefined
				}
			},
			{
				new: true
			}
		)
		
		const options={
			httpOnly:true,
			secure:true
		   }

		   return res
		   .status(200)
		   .clearCookie("accessToken",options)
		   .clearCookie("refreshToken",options)
		   .json(
			new ApiResponse(200,{},"User logged out")
		   )
})

const refreshAccessToken =asyncHandler(async (req,res) =>
{
	const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken

	if(!incomingRefreshToken){
		throw new ApiError(401,"unauthorized request")
	}

	try {
		const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
	
	     const user=await User.findById(decodedToken?._id)
	
		 if(!user)
		 {
			throw new ApiError(401,"Invalid refreshToken")
		 }
	
		 if(incomingRefreshToken !== user?.refreshToken){
			throw new ApiError(401,"Refresh token is expired or used")
		 }
	
		 const options={
			httpOnly:true,
			secure:true
		 }
	
		 const {accessToken,newrefreshToken }=await generateAccessAndRefreshToken(user._id)
	
		 return res.status(200)
		 .cookie("accessToken",accessToken,options)
		 .cookie("refreshToken",newrefreshToken,options)
		 .json(
			new ApiResponse(
				200,
				{accessToken,newrefreshToken}
			),
			"access token is refresh"
		 )
	} catch (error) {
		throw new ApiError(401,error?.message || "invalid refresh token")
	}

})


export {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken
}