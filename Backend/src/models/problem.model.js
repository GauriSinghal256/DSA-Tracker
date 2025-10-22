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
  link: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  status: {
    type: String,
    enum: ["unsolved", "solved", "redo"],
    default: "unsolved",
  },
  solvedAt: {
    type: Date,
  },
  redoAt: {
    type: Date, // for reminder (redo timer)
  },
  notes: {
    type: String, // user notes or key learning
},
noteImage: {
    type: String, // URL from Cloudinary
},

  tags: [
    {
      type: String, // e.g., "DP", "Array", "Binary Search"
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export const Problem = mongoose.model("Problem", problemSchema);
