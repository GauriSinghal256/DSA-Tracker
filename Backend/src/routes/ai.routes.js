import { Router } from "express";
import { chatWithAI } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// AI chat endpoint
router.post("/chat", verifyJWT, chatWithAI);

export default router;
