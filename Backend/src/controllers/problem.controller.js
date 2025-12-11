import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import { Problem } from '../models/problem.model.js';
import { ProblemHistory } from '../models/problemHistory.model.js';

// POST /api/problems/log
export const logProblem = asyncHandler(async (req, res) => {
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
      status = "Solved",
    } = req.body;

    // Validate required fields and return which ones are missing
    const required = { title, platform, Problem_URL, difficulty };
    const missingReq = Object.entries(required).reduce((acc, [k, v]) => {
      if (typeof v === 'undefined' || v === null || (typeof v === 'string' && v.trim() === '')) acc.push(k);
      return acc;
    }, []);

    if (missingReq.length > 0) {
      throw new ApiError(400, `Missing required field(s): ${missingReq.join(', ')}.`);
    }
    
    // Map status values
    const statusMap = {
      "solved": "Solved",
      "unsolved": "To Do",
      "attempted": "Attempted",
      "redo": "Redo"
    };
    
    const finalStatus = statusMap[status?.toLowerCase()] || status || "Solved";

    // Parse tags if it's a string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = Array.isArray(tags) ? tags : [];
      }
    }

    // Step 1: Check if the problem already exists globally
    let problem = await Problem.findOne({ title, platform, Problem_URL });
    if (!problem) {
      problem = await Problem.create({
        title,
        platform,
        Problem_URL,
        difficulty,
        tags: parsedTags,
      });
    }

   let notesImageUrl = null; // default: no image

const notesImageLocalPath = req.files?.notesImage?.[0]?.path;
console.log("Notes image path:", notesImageLocalPath);

if (notesImageLocalPath) {
  try {
    const uploadedImage = await uploadToCloudinary(notesImageLocalPath);

    if (!uploadedImage || !uploadedImage.url) {
      console.error("Cloudinary upload failed: no URL returned");
      // Don't fail the whole request if image upload fails, just log it
      console.warn("Saving problem without image due to upload failure");
    } else {
      notesImageUrl = uploadedImage.url;
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Don't fail the whole request if image upload fails, just log it
    console.warn("Saving problem without image due to upload error");
  }
}
    
    // Step 2: Create or update user's personal history for that problem
    let history = await ProblemHistory.findOne({ user: userId, problem: problem._id });
    if (!history) {
      history = await ProblemHistory.create({
        user: userId,
        problem: problem._id,
        status: finalStatus,
        solvedAt: solvedAt || new Date(),
        redoAt,
        notes,
        noteImage: notesImageUrl,
      });
    } else {
      // update existing history
      history.status = finalStatus || history.status;
      history.solvedAt = solvedAt || history.solvedAt;
      history.redoAt = redoAt || history.redoAt;
      history.notes = notes || history.notes;
      if (notesImageUrl) {
        history.noteImage = notesImageUrl;
      }
      await history.save();
    }

    return res.status(200).json({
      success: true,
      message: "Problem logged successfully",
      accessToken: req.accessToken,
      data: { problem, history },
    });
});

export const getUserProblems = asyncHandler(async (req, res) => {
  const userId = req.user._id; // from JWT

  const histories = await ProblemHistory.find({ user: userId })
    .populate("problem") // populate full problem info
    .sort({ solvedAt: -1 }); // optional: latest first

  return res.status(200).json({
    success: true,
    count: histories.length,
    data: histories
  });
});

// Update notes for a problem
export const updateProblemNotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { problemHistoryId } = req.params;
  const { notes } = req.body;

  const problemHistory = await ProblemHistory.findOne({
    _id: problemHistoryId,
    user: userId
  });

  if (!problemHistory) {
    throw new ApiError(404, "Problem history not found for the given id and user.");
  }

  problemHistory.notes = notes;
  await problemHistory.save();

  return res.status(200).json({
    success: true,
    message: "Notes updated successfully",
    data: problemHistory
  });
});


// Get analytics for the user
export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get all problems for the user
  const histories = await ProblemHistory.find({ user: userId })
    .populate("problem")
    .sort({ solvedAt: -1 });

  // Calculate statistics
  const totalProblems = histories.length;
  const solvedProblems = histories.filter(h => h.status === 'Solved').length;
  const attemptedProblems = histories.filter(h => h.status === 'Attempted').length;
  const toDoProblems = histories.filter(h => h.status === 'To Do').length;
  
  // Difficulty breakdown
  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
  histories.forEach(h => {
    const diff = h.problem?.difficulty;
    if (diff && difficultyCounts.hasOwnProperty(diff)) {
      difficultyCounts[diff]++;
    }
  });

  // Platform breakdown
  const platformCounts = {};
  histories.forEach(h => {
    const platform = h.problem?.platform;
    if (platform) {
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    }
  });

  // Topic breakdown
  const topicCounts = {};
  histories.forEach(h => {
    const tags = h.problem?.tags || [];
    tags.forEach(tag => {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    });
  });

  // Weekly progress (last 4 weeks)
  // Use consistent week boundaries (Monday - Sunday) and non-overlapping ranges.
  const now = new Date();
  // Normalize to local midnight
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Find start of current week (Monday)
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday, ... 6 = Sunday
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - dayOfWeek);

  const weeklyData = [];

  const formatShort = (d) => {
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
  };

  // Build 4 weeks: oldest -> newest
  for (let k = 3; k >= 0; k--) {
    const weekStart = new Date(startOfCurrentWeek);
    weekStart.setDate(startOfCurrentWeek.getDate() - k * 7);

    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(weekStart.getDate() + 7);

    const weekProblems = histories.filter(h => {
      const solvedDate = new Date(h.solvedAt);
      // include dates >= weekStart and < nextWeekStart to avoid overlap
      return solvedDate >= weekStart && solvedDate < nextWeekStart;
    }).length;

    weeklyData.push({
      week: `${formatShort(weekStart)} - ${formatShort(new Date(nextWeekStart.getTime() - 1))}`,
      problems: weekProblems
    });
  }

  // Calculate accuracy (solved / total attempts)
  const accuracy = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  // Calculate current streak
  let currentStreak = 0;
  if (histories.length > 0) {
    const solvedHistory = histories
      .filter(h => h.status === 'Solved')
      .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
    
    if (solvedHistory.length > 0) {
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < solvedHistory.length; i++) {
        const solvedDate = new Date(solvedHistory[i].solvedAt);
        solvedDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((checkDate - solvedDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === currentStreak) {
          currentStreak++;
        } else if (daysDiff > currentStreak) {
          break;
        }
      }
    }
  }

  // Calculate weekly average
  const totalIn4Weeks = weeklyData.reduce((sum, week) => sum + week.problems, 0);
  const weeklyAverage = Math.round(totalIn4Weeks / 4);

  return res.status(200).json({
    success: true,
    data: {
      totalProblems,
      solvedProblems,
      attemptedProblems,
      toDoProblems,
      accuracy,
      currentStreak,
      weeklyAverage,
      difficultyStats: {
        Easy: difficultyCounts.Easy,
        Medium: difficultyCounts.Medium,
        Hard: difficultyCounts.Hard
      },
      platformStats: platformCounts,
      topicStats: topicCounts,
      weeklyProgress: weeklyData
    }
  });
});

// Get notifications for problems due for redo
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Find all problems with redoAt date that has arrived
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const histories = await ProblemHistory.find({
    user: userId,
    redoAt: { $lte: today },
    status: { $nin: ['Redo'] } // Exclude problems already marked as Redo
  }).populate('problem');

  // Format notifications
  const notifications = histories.map(h => ({
    _id: h._id,
    title: h.problem.title,
    difficulty: h.problem.difficulty,
    redoAt: h.redoAt,
    platform: h.problem.platform
  }));

  return res.status(200).json({
    success: true,
    data: notifications
  });
});

// Mark problem as redone
export const markAsRedone = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { problemHistoryId } = req.params;

  const problemHistory = await ProblemHistory.findOne({
    _id: problemHistoryId,
    user: userId
  });

  if (!problemHistory) {
    throw new ApiError(404, "Problem history not found for the given id and user.");
  }

  // Update the status to 'Redo' and set solvedAt to current time
  problemHistory.status = 'Redo';
  problemHistory.solvedAt = new Date();
  problemHistory.redoAt = null; // Clear the redo date since it's been redone
  
  await problemHistory.save();

  return res.status(200).json({
    success: true,
    message: "Problem marked as redone successfully",
    data: problemHistory
  });
});