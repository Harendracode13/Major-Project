import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const verifyJWT=asyncHandler(async(req,_,next)=>{
	try {
		const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
	
		if(!token){
			throw new ApiError(401,"unauthorization required")
		}
	
		const decodedToken =jwt.verifyJWT(token,process.env.ACCESS_TOKEN_SECRET)
	
		const user=await User.findById(decodedToken?._id).select("=password -refreshToken")
	
		if (!user){
			throw new ApiError(401,"invaid access token")
		}
		req.user=user;
		next()
	} catch (error) {
		throw new ApiError(401,error?.message || "invaid access token")
	}
})