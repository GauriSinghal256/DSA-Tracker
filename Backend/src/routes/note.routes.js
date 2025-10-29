import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
    createNote,
    getUserNotes,
    getNoteById,
    updateNote,
    deleteNote,
    deleteAttachment,
    getUserTopics,
    getPublicNotes
} from '../controllers/note.controller.js';

const router = Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// Create a new note with file upload support
router.route('/').post(
    upload.fields([
        { name: 'attachments', maxCount: 10 } // Allow up to 10 files
    ]),
    createNote
);

// Get all notes for the authenticated user
router.route('/').get(getUserNotes);

// Get all topics for the user
router.route('/topics').get(getUserTopics);

// Get public notes (community sharing)
router.route('/public').get(getPublicNotes);

// Get a single note by ID
router.route('/:noteId').get(getNoteById);

// Update a note with file upload support
router.route('/:noteId').put(
    upload.fields([
        { name: 'attachments', maxCount: 10 }
    ]),
    updateNote
);

// Delete a note
router.route('/:noteId').delete(deleteNote);

// Delete an attachment from a note
router.route('/:noteId/attachments/:attachmentId').delete(deleteAttachment);

export default router;
