import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Check for token in cookies or Authorization header
        const authHeader = req.header("Authorization");
        const cookieToken = req.cookies?.accessToken;
        
        let token;
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.replace("Bearer ", "");
        } else if (cookieToken) {
            token = cookieToken;
        }
        
        if(!token){
            throw new ApiError(401 , "Not authorized, token missing")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401 , "Invalid access token, user not found")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401 , `Not authorized: ${error.message}`)
    }
})    