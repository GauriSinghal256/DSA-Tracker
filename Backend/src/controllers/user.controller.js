import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) =>{
    try{
        const user =  await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        
        return {accessToken , refreshToken}
    }catch(error){
        throw new ApiError(500 , "Something Went wrong in token generation")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const {fullName, year , email , username , password} = req.body
    console.log("email" , email);

    // Validate required fields and produce clear error messages listing missing fields
    const requiredFields = { fullName, year, email, username, password };
    const missing = Object.entries(requiredFields).reduce((acc, [key, val]) => {
        if (typeof val === 'undefined' || val === null || (typeof val === 'string' && val.trim() === '')) acc.push(key);
        return acc;
    }, []);

    if (missing.length > 0) {
        throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}.`);
    }

     const existedUser =await User.findOne({
        $or: [{email} , {username: username.toLowerCase()}]
     })

     if(existedUser){
        if(existedUser.email === email){
            throw new ApiError(409 , "User with this email already exists")
        }
        if(existedUser.username === username.toLowerCase()){
            throw new ApiError(409 , "Username is already taken")
        }
        throw new ApiError(409 , "User already exists")
     }

     const avatarLocalPath = req.files?.avatar?.[0]?.path;
     let avatarUrl = null;

     if (avatarLocalPath) {
        // upload to cloudinary
        const avatar = await uploadToCloudinary(avatarLocalPath);
        if (!avatar || !avatar.url) {
            // Log warning but don't block registration
            console.warn('Avatar upload failed or returned no url; continuing without avatar');
        } else {
            avatarUrl = avatar.url;
        }
     }

    const userData = {
        fullName,
        year,
        email,
        password,
        username: username.toLowerCase(),
    };

    if (avatarUrl) userData.avatar = avatarUrl;

    const user = await User.create(userData);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 , "User creation failed")
    }
    
    // Generate tokens for the newly created user
    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    const options = {
        httpOnly: true,
        secure: true,
    }
    
    return res
    .status(201)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(201 , {user: createdUser , accessToken , refreshToken} , "User created successfully")
    )
})   

const loginUser = asyncHandler(async (req, res) => {
    const{email , username , password} = req.body
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Request body:", req.body);
    console.log("Email:", email);
    console.log("Username:", username);
    console.log("Password:", password ? "***" : "missing");

    if(!username && !email){
        throw new ApiError(400 , "Username or email is required")
    }

    // Search for user by email first, then username
    let user = null;
    
    if(email){
        user = await User.findOne({ email: email });
        console.log("Searched by email:", email);
    }
    
    if(!user && username){
        user = await User.findOne({ username: username.toLowerCase() });
        console.log("Searched by username:", username.toLowerCase());
    }

    console.log("User found:", user ? "YES" : "NO");
    
    if(user){
        console.log("User details:");
        console.log("- ID:", user._id);
        console.log("- Email:", user.email);
        console.log("- Username:", user.username);
        console.log("- Full Name:", user.fullName);
    } else {
        // List all users in database for debugging
        const allUsers = await User.find({}, 'email username');
        console.log("All users in database:", allUsers);
    }

    if(!user){
        throw new ApiError(404 , "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    console.log("Password valid:", isPasswordValid);
    
    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
    console.log("Tokens generated successfully");
     
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    
    console.log("=== LOGIN SUCCESS ===");
    
    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(200 , {user: loggedInUser , accessToken , refreshToken} , "Login successful")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id , 
    {
       $set : {refreshToken : undefined}
    },
    {
        new : true
    })

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200 , null , "Logout successful")
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401 , "Invalid RefreshToken")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
             throw new ApiError(401 , " RefreshToken is expired")
        }
    
        const options = {
            httpOnly:true,
            secure: true
        }
        
        const{ accessToken , newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        return res
        .status(200)
        .cookie("accessToken" ,accessToken ,options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(
            new ApiResponse(
                200,
                {accessToken ,refreshToken: newRefreshToken},
                "Access token refreshed Successfully"
            )
        )
        
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid Refresh Token")
    }

})


const changeCurrentPassword = asyncHandler(async (req , res)=>{
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id) 
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400 , "Invalid Old Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async(req , res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName , email , year} = req.body

    const missing = [];
    if (!fullName) missing.push('fullName');
    if (!email) missing.push('email');

    if (missing.length > 0) {
        throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}.`);
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName: fullName,
                email:email,
                year: year
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account Details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing from request. Please upload a file with field name 'avatar'.");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    if(!avatar || !avatar.url){
        throw new ApiError(500, "Failed to upload avatar image to cloud storage. Try again later.");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Image updated successfully")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
}