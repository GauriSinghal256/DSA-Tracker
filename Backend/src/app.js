import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"; 
import problemRouter from "./routes/problem.routes.js";
import aiRouter from "./routes/ai.routes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// 🔥 Mount the auth router
app.use("/api/auth", userRouter);
app.use("/api/problems",problemRouter)
app.use("/api/ai", aiRouter);

export { app };
