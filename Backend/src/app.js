import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"; 
import problemRouter from "./routes/problem.routes.js";
import aiRouter from "./routes/ai.routes.js";
import communityRouter from "./routes/community.routes.js";
import noteRouter from "./routes/note.routes.js";
import { ApiError } from './utils/ApiError.js';
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://dsa-tracker-pearl.vercel.app",
        "https://dsa-tracker-pearl-git-main-gauri-singhal.vercel.app"
    ], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// 🔥 Mount the auth router
app.use("/api/auth", userRouter);
app.use("/api/problems",problemRouter)
app.use("/api/ai", aiRouter);
app.use("/api/community", communityRouter);
app.use("/api/notes", noteRouter);

// Centralized error handler: catches ApiError and other errors and returns JSON
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'An error occurred',
            errors: err.errors || []
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    // Default to 500
    return res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

export { app };
