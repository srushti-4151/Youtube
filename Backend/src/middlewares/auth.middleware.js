import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/AsyncHandler.js"

//whenever we want to check if user is loggedin or not 
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // The token can be in cookies or in the request header (as we set it in the login response).
        // Authorization: Bearer <token> we want only token
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        //see in model where we created tokens we seeted _id name thats why it is here
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

export const optionalVerifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            req.user = null; // No token, set req.user to null and continue
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            req.user = null; // Invalid token, treat user as not logged in
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        req.user = null; // If token is invalid, just continue without throwing an error
        next();
    }
});
