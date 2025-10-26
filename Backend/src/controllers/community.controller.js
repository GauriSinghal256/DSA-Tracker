import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Post } from '../models/post.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Create a new post
export const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
        throw new ApiError(400, "Post content is required");
    }

    // Extract hashtags from content
    const hashtags = content.match(/#\w+/g) || [];
    const processedHashtags = hashtags.map(tag => tag.substring(1).toLowerCase());

    let postImages = [];
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
            try {
                const uploadedImage = await uploadToCloudinary(file.path);
                if (uploadedImage && uploadedImage.url) {
                    return uploadedImage.url;
                }
                return null;
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return null;
            }
        });
        
        postImages = (await Promise.all(uploadPromises)).filter(url => url !== null);
    }

    const post = await Post.create({
        content: content.trim(),
        author: userId,
        images: postImages,
        hashtags: processedHashtags
    });

    await post.populate('author', 'username fullName avatar');

    return res.status(201).json(
        new ApiResponse(201, post, "Post created successfully")
    );
});

// Get all posts (with pagination)
export const getAllPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
        .populate('author', 'username fullName avatar')
        .populate('likes', 'username fullName avatar')
        .populate('comments.author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Post.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        }, "Posts fetched successfully")
    );
});

// Get a single post by ID
export const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId)
        .populate('author', 'username fullName avatar')
        .populate('likes', 'username fullName avatar')
        .populate('comments.author', 'username fullName avatar');

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(
        new ApiResponse(200, post, "Post fetched successfully")
    );
});

// Like a post
export const likePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = post.likes.includes(userId);
    
    if (alreadyLiked) {
        // Unlike
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
        // Like
        post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json(
        new ApiResponse(200, post, alreadyLiked ? "Post unliked" : "Post liked successfully")
    );
});

// Comment on a post
export const commentOnPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
        throw new ApiError(400, "Comment content is required");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    post.comments.push({
        content: content.trim(),
        author: userId
    });

    await post.save();

    // Populate the newly added comment's author
    const updatedPost = await Post.findById(postId)
        .populate('author', 'username fullName avatar')
        .populate('likes', 'username fullName avatar')
        .populate('comments.author', 'username fullName avatar');

    return res.status(200).json(
        new ApiResponse(200, updatedPost, "Comment added successfully")
    );
});

// Get posts by hashtag
export const getPostsByHashtag = asyncHandler(async (req, res) => {
    const { hashtag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ hashtags: hashtag.toLowerCase() })
        .populate('author', 'username fullName avatar')
        .populate('likes', 'username fullName avatar')
        .populate('comments.author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Post.countDocuments({ hashtags: hashtag.toLowerCase() });

    return res.status(200).json(
        new ApiResponse(200, {
            posts,
            hashtag,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        }, "Posts fetched successfully")
    );
});

// Delete a post (only by author)
export const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.author.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own posts");
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json(
        new ApiResponse(200, null, "Post deleted successfully")
    );
});
