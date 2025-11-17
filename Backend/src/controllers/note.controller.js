import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Note } from '../models/note.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Create a new note
const createNote = asyncHandler(async (req, res) => {
    const { title, description, topic, tags, isPublic } = req.body;
    
    const missing = [];
    if (!title) missing.push('title');
    if (!description) missing.push('description');
    if (!topic) missing.push('topic');

    if (missing.length > 0) {
        throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}.`);
    }

    // Handle file uploads
    const attachments = [];
    if (req.files && req.files.attachments) {
        for (const file of req.files.attachments) {
            const uploadedFile = await uploadToCloudinary(file.path);
            if (uploadedFile) {
                attachments.push({
                    type: file.mimetype.startsWith('image/') ? 'image' : 'pdf',
                    url: uploadedFile.url,
                    filename: uploadedFile.public_id,
                    originalName: file.originalname,
                    size: file.size
                });
            }
        }
    }

    const note = await Note.create({
        title,
        description,
        topic,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        isPublic: isPublic === 'true',
        attachments,
        owner: req.user._id
    });

    const createdNote = await Note.findById(note._id).populate('owner', 'username fullName avatar');

    return res.status(201).json(
        new ApiResponse(201, createdNote, "Note created successfully")
    );
});

// Get all notes for the authenticated user
const getUserNotes = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, topic, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { owner: req.user._id };

    // Filter by topic if provided
    if (topic) {
        query.topic = { $regex: topic, $options: 'i' };
    }

    // Search in title and description if provided
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    const notes = await Note.find(query)
        .populate('owner', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalNotes = await Note.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            notes,
            totalNotes,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalNotes / limit)
        }, "Notes fetched successfully")
    );
});

// Get a single note by ID
const getNoteById = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await Note.findById(noteId).populate('owner', 'username fullName avatar');

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    // Check if user owns the note or if it's public
    if (note.owner._id.toString() !== req.user._id.toString() && !note.isPublic) {
        throw new ApiError(403, "Access denied: you do not have permission to view this note.");
    }

    return res.status(200).json(
        new ApiResponse(200, note, "Note fetched successfully")
    );
});

// Update a note
const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { title, description, topic, tags, isPublic } = req.body;

    const note = await Note.findById(noteId);

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied: you can only update your own notes.");
    }

    // Handle new file uploads
    const newAttachments = [];
    if (req.files && req.files.attachments) {
        for (const file of req.files.attachments) {
            const uploadedFile = await uploadToCloudinary(file.path);
            if (uploadedFile) {
                newAttachments.push({
                    type: file.mimetype.startsWith('image/') ? 'image' : 'pdf',
                    url: uploadedFile.url,
                    filename: uploadedFile.public_id,
                    originalName: file.originalname,
                    size: file.size
                });
            }
        }
    }

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        {
            $set: {
                title: title || note.title,
                description: description || note.description,
                topic: topic || note.topic,
                tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : note.tags,
                isPublic: isPublic !== undefined ? isPublic === 'true' : note.isPublic,
                lastModified: new Date()
            },
            $push: {
                attachments: { $each: newAttachments }
            }
        },
        { new: true }
    ).populate('owner', 'username fullName avatar');

    return res.status(200).json(
        new ApiResponse(200, updatedNote, "Note updated successfully")
    );
});

// Delete a note
const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied: you can only delete your own notes.");
    }

    await Note.findByIdAndDelete(noteId);

    return res.status(200).json(
        new ApiResponse(200, null, "Note deleted successfully")
    );
});

// Delete an attachment from a note
const deleteAttachment = asyncHandler(async (req, res) => {
    const { noteId, attachmentId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied: you can only modify attachments for your own notes.");
    }

    const attachment = note.attachments.id(attachmentId);
    if (!attachment) {
        throw new ApiError(404, "Attachment not found");
    }

    attachment.deleteOne();

    await note.save();

    return res.status(200).json(
        new ApiResponse(200, note, "Attachment deleted successfully")
    );
});

// Get all topics for the user
const getUserTopics = asyncHandler(async (req, res) => {
    const topics = await Note.distinct('topic', { owner: req.user._id });
    
    return res.status(200).json(
        new ApiResponse(200, topics, "Topics fetched successfully")
    );
});

// Get public notes (for community sharing)
const getPublicNotes = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, topic, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };

    if (topic) {
        query.topic = { $regex: topic, $options: 'i' };
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    const notes = await Note.find(query)
        .populate('owner', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalNotes = await Note.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            notes,
            totalNotes,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalNotes / limit)
        }, "Public notes fetched successfully")
    );
});

export {
    createNote,
    getUserNotes,
    getNoteById,
    updateNote,
    deleteNote,
    deleteAttachment,
    getUserTopics,
    getPublicNotes
};
