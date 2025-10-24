import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import { Problem } from '../models/problem.model.js';
import { ProblemHistory } from '../models/problemHistory.model.js';

// POST /api/problems/log
export const logProblem = async (req, res) => {
  try {
    const userId = req.user._id; // from JWT
    const {
      title,
      platform,
      Problem_URL,
      difficulty,
      tags,
      solvedAt,
      redoAt,
      notes,
      noteImage,
      status,
    } = req.body;

    console.log("problem Title:", title);

    if(
        [title, platform, Problem_URL, difficulty, status].some((field)=>
            field?.trim() === "")
    ) {
        throw new ApiError(400 , "Required fields are missing")
      } 

    // Step 1: Check if the problem already exists globally
    let problem = await Problem.findOne({ title, platform, Problem_URL });
    if (!problem) {
      problem = await Problem.create({
        title,
        platform,
        Problem_URL,
        difficulty,
        tags,
      });
    }

   let notesImage = null; // default: no image

const notesImageLocalPath = req.files?.notesImage?.[0]?.path;

if (notesImageLocalPath) {
  notesImage = await uploadToCloudinary(notesImageLocalPath);

  if (!notesImage) {
    throw new ApiError(500, "NotesImage upload failed");
  }
}
    
    // Step 2: Create or update user’s personal history for that problem
    let history = await ProblemHistory.findOne({ user: userId, problem: problem._id });
    if (!history) {
      history = await ProblemHistory.create({
        user: userId,
        problem: problem._id,
        status,
        solvedAt,
        redoAt,
        notes,
        noteImage,
      });
    } else {
      // update existing history
      history.status = status || history.status;
      history.solvedAt = solvedAt || history.solvedAt;
      history.redoAt = redoAt || history.redoAt;
      history.notes = notes || history.notes;
      history.noteImage = noteImage || history.noteImage;
      await history.save();
    }

    return res.status(200).json({
      success: true,
      message: "Problem logged successfully",
      data: { problem, history },
    });

  } catch (error) {
    console.error("Error logging problem:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const getUserProblems = async (req, res) => {
  try {
    const userId = req.user._id; // from JWT

    const histories = await ProblemHistory.find({ user: userId })
      .populate("problem") // populate full problem info
      .sort({ solvedAt: -1 }); // optional: latest first

    return res.status(200).json({
      success: true,
      count: histories.length,
      data: histories
    });
  } catch (error) {
    console.error("Error fetching user problems:", error);
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};