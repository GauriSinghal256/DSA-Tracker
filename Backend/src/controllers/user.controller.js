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

    if(
        [year ,fullName, email , username , password].some((field)=>
            field?.trim() === "")
    ) {
        throw new ApiError(400 , "All fields are required")
      }

     const existedUser =await User.findOne({
        $or: [{email} , {username}]
     })

     if(existedUser){
        throw new ApiError(409 , "User already exists with this email or username")
     }

     const avatarLocalPath =  req.files?.avatar[0]?.path;
     if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar is required")
     }

    //upload to cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath)
    
    if(!avatar){
        throw new ApiError(500 , "Avatar upload failed")
    }

    const user = await User.create({
        fullName,
        year,
        avatar: avatar.url,
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 , "User creation failed")
    }
    
    return res.status(201).json(
        new ApiResponse(201 , createdUser , "User created successfully")
    )
})   

const loginUser = asyncHandler(async (req, res) => {
    const{email , username , password} = req.body
    console.log(email);

    if(!username && !email){
        throw new ApiError(400 , "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{email} , {username}]
    })

    if(!user){
        throw new ApiError(404 , "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
     
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    
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

    if(!fullName || !email){
        throw new ApiError(404 , "All fields are required")
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
        throw new ApiError(400 ,"Avatar file is missing")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400 ,"Error while uploading on Avatar")
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