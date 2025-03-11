import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
//first with the help of multer we will take file from user and keep it in our localserver for temporary
//By using cloudinary take file from that locaserver and then we will put it on server
//then remove it from localserver
//why? : for reattempt to reupload two step settings

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been successfully uploaded
    //console.log("file is uploaded sccessfully");
    //console.log("respone of file : ", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove locally saved temporry file as the upload operation failed
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    const publicId = url.split("/").pop().split(".")[0];
    if (!publicId) {
      throw new Error("Invalid Cloudinary URL: Unable to extract public ID");
    }

    // Delete the file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary:", result);

    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    throw error;
  }
};

export { 
  uploadOnCloudinary,
  deleteFromCloudinary
};
