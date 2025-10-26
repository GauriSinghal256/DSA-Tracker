import { Router } from "express";
import { logProblem, getUserProblems, updateProblemNotes } from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// secure route
router.post("/log", verifyJWT, upload.fields([{ name: "notesImage", maxCount: 1 }]), logProblem);
// Get all problems for the logged-in user
router.get("/allProblems", verifyJWT, getUserProblems);
// Update notes for a problem
router.put("/:problemHistoryId/notes", verifyJWT, updateProblemNotes);

export default router;