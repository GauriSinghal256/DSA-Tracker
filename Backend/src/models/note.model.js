import mongoose, { Schema } from 'mongoose';

const noteSchema = new Schema({
    title: {
        type: String,
        required: [true, "Note title is required"],
        trim: true,
        maxLength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
        type: String,
        required: [true, "Note description is required"],
        trim: true,
        maxLength: [2000, "Description cannot exceed 2000 characters"]
    },
    topic: {
        type: String,
        required: [true, "Topic is required"],
        trim: true,
        maxLength: [50, "Topic cannot exceed 50 characters"]
    },
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'pdf'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    }],
    tags: [{
        type: String,
        trim: true,
        maxLength: [20, "Each tag cannot exceed 20 characters"]
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
noteSchema.index({ owner: 1, createdAt: -1 });
noteSchema.index({ topic: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ title: "text", description: "text" });

export const Note = mongoose.model('Note', noteSchema);
