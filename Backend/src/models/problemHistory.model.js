import mongoose, { Schema } from "mongoose";

const problemHistorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problem: {
    type: Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  solvedAt: {
    type: Date,
    default: Date.now,
  },
  redoAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
  noteImage: {
    type: String,
  },
  timeTaken: {
    type: Number, // optional: in minutes
  },
  status: {
    type: String,
    enum: ["Solved", "Attempted", "To Do", "Redo"],
    default: "Solved",
  },
}, { timestamps: true });

export const ProblemHistory = mongoose.model("ProblemHistory", problemHistorySchema);
