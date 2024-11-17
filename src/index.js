//require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
//import mongoose from "mongoose";
//import {DB_NAME} from "./constants.js";

dotenv.config({
	path:'./.env'
})
import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB()
.then(()=>{
	app.listen(process.env.PORT || 8100,()=>{
		console.log(`sever is ready and running on ${process.env.PORT}`);
	})
})
.catch((err)=>{
	console.log("mongodb cnnection failed");
})


/*

/*
import express from "express";
const app=express();

(async()=>{
	try{
		await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
		app.on("error :",(error)=>{
			console.log("errr: ",error);
			throw error;
		})
		app.listen(process.env.PORT,()=>{
			console.log(`app is lisning on ${process.env.PORT}`);
		})
	}
	catch (error){
		console.log("ERROR: ",error)
		throw error
	}
})
()*/
