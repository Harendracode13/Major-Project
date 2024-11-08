import { v2 as cloudinary } from "cloudinary"; 
import fs from "fs";


cloudinary.config({
	cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
	api_key:process.env.CLOUDINARY_API_KEY,
	api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async (localFilePath)=>{

	try {
		if(!localFilePath) return null;

		//upload on cloudinary		
       const respose= await cloudinary.uploader.upload(localFilePath,{
			resource_type:"auto"
		})
		//file has been uploaded successfull
		//console.log("file is uploaded on cloudyinary ",respose.url);
		fs.unlinkSync(localFilePath)
		return respose;
	}catch(error){
		fs.unlinkSync(localFilePath)//remove file
		return null
	}
}

export {uploadOnCloudinary}