// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

//this method is async so this will return promise
connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("ERRR: ", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!", err);
  });
  

dotenv.config({
  path: "./.env",
});

// import express from "express";
// const app = express()

// ;( async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", () => {
//             console.log("ERRR: ", error);
//             throw error
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })
//     }catch(err){
//         console.log("ERROR: ", err)
//         throw err
//     }
// }) ()
