import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
export const verifyJWT = asyncHandler(async (req, res, next) => {
    // get token from headers
    // if not present -> error
    // if present -> verify the token
    // if not valid -> error
    // if valid -> attach user to req object and call next()    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401 , "Not authorized , token missing")
        }
    
        const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401 , "Invalid access token , user not found")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401 , "Not authorized , token invalid" + error.message)
    }
})    