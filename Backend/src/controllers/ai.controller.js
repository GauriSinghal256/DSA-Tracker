import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 🧩 Helper function for fallback (if Gemini not working)
const generateFallbackResponse = (message, lastProblem) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("algorithm") || lowerMessage.includes("algo")) {
        return `🤖 **Algorithm Guidance**  
Focus on these algorithm types:  
• Sorting (Quick Sort, Merge Sort, Heap Sort)  
• Searching (Binary Search, DFS, BFS)  
• Dynamic Programming (Memoization, Tabulation)  
• Graph Algorithms (Dijkstra, Floyd-Warshall)  
• Tree Traversals (Inorder, Preorder, Postorder)  
Practice implementing them from scratch to build intuition!`;
    }

    if (lowerMessage.includes("data structure") || lowerMessage.includes("ds")) {
        return `🏗️ **Data Structures to Master**  
• Arrays, Strings (Two Pointers, Sliding Window)  
• Linked Lists (Reversal, Cycle Detection)  
• Stacks & Queues (Monotonic Stack, BFS)  
• Trees (BST, AVL, Trie)  
• Graphs (Adjacency List, Matrix)  
• Hash Tables (Collision Handling)`;
    }

    if (lowerMessage.includes("interview")) {
        return `🎯 **Interview Preparation Tips**  
• 2–3 problems per topic  
• Time complexity analysis  
• Mock interviews weekly  
Focus on Arrays, Trees, Graphs, DP, and System Design.`;
    }

    if (lowerMessage.includes("practice")) {
        return `📚 **Study Plan**  
**Daily:** Solve 1–2 problems & review old ones  
**Weekly:** Focus each day on a topic (Arrays, Trees, Graphs, DP)  
**Weekend:** Revise + mock interviews  
Consistency > Quantity.`;
    }

    return `🤖 **General DSA Guidance**  
1️⃣ Understand the problem clearly  
2️⃣ Identify patterns & suitable data structures  
3️⃣ Write a plan before coding  
4️⃣ Test with edge cases  
5️⃣ Optimize  
Practice patterns like Two Pointers, Sliding Window, DP, Graphs, etc.`;
};

// 🚀 Main Controller
const chatWithAI = asyncHandler(async (req, res) => {
    console.log("📩 Incoming AI chat request:", req.body);

    const { message, lastProblem } = req.body;

    if (!message || message.trim() === "") {
        throw new ApiError(400, "Message is required");
    }

    // ✅ Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ GEMINI_API_KEY is missing. Using fallback response...");
        const fallbackResponse = generateFallbackResponse(message, lastProblem);
        return res
            .status(200)
            .json(new ApiResponse(200, { response: fallbackResponse }, "Fallback used"));
    }

    try {
        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build prompt context
        let context = `
You are an expert DSA mentor helping students improve problem-solving skills.
Your response should be:
• Clear and actionable  
• Motivating and encouraging  
• Based on the student's last solved problem (if any)`;

        if (lastProblem) {
            context += `
The student recently solved:
- Title: ${lastProblem.title}
- Platform: ${lastProblem.platform}
- Difficulty: ${lastProblem.difficulty}
- Tags: ${lastProblem.tags.join(", ")}
Use this context to give relevant next steps.`;
        }

        const prompt = `${context}\n\nStudent Query: ${message}\n\nRespond in 2–3 short paragraphs with encouragement and actionable steps.`;

        console.log("🧠 Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        console.log("✅ Gemini response generated successfully.");
        return res
            .status(200)
            .json(new ApiResponse(200, { response: text }, "AI response generated"));
    } catch (error) {
        console.error("❌ Gemini AI Error:", error.message);
        const fallbackResponse = generateFallbackResponse(message, lastProblem);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { response: fallbackResponse },
                    "Fallback used due to Gemini error"
                )
            );
    }
});

export { chatWithAI };
