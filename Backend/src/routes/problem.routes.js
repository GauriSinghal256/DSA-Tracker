import { Router } from "express";
import { logProblem } from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserProblems } from "../controllers/problem.controller.js";
const router = Router();

// secure route
router.post("/log", verifyJWT, logProblem);
// Get all problems for the logged-in user
router.get("/allProblems", verifyJWT, getUserProblems);

export default router;