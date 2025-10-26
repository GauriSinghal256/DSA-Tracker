import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    images: [{
        type: String // Cloudinary URLs
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        content: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    hashtags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true
});

// Index for hashtags
postSchema.index({ hashtags: 1 });
postSchema.index({ author: 1 });

export const Post = mongoose.model('Post', postSchema);
