import mongoose, { Schema } from "mongoose";

const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  platform: {
    type: String, // e.g., "LeetCode", "Codeforces"
    required: true,
  },
  Problem_URL: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium" , "Medium-Hard", "Hard"],
    required: true,
  },
  tags: [
    {
      type: String, // e.g., "DP", "Array", "Binary Search"
    },
  ],
}, { timestamps: true });

export const Problem = mongoose.model("Problem", problemSchema);
