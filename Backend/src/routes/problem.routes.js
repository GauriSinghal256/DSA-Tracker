import { Router } from "express";
import { logProblem, getUserProblems, updateProblemNotes, getAnalytics, getNotifications, markAsRedone } from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// secure route
router.post("/log", verifyJWT, upload.fields([{ name: "notesImage", maxCount: 1 }]), logProblem);
// Get all problems for the logged-in user
router.get("/allProblems", verifyJWT, getUserProblems);
// Update notes for a problem
router.put("/:problemHistoryId/notes", verifyJWT, updateProblemNotes);
// Get analytics
router.get("/analytics", verifyJWT, getAnalytics);
// Get notifications
router.get("/notifications", verifyJWT, getNotifications);
// Mark problem as redone
router.put("/:problemHistoryId/redo", verifyJWT, markAsRedone);

export default router;