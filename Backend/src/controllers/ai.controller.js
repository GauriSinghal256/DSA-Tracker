import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = asyncHandler(async (req, res) => {
    const { message, lastProblem } = req.body;
    
    if (!message || message.trim() === '') {
        throw new ApiError(400, 'Message is required');
    }

    try {
        // Get Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Build context for the AI
        let context = `You are an expert coding mentor and DSA coach helping students with their Data Structures and Algorithms journey. `;
        
        if (lastProblem) {
            context += `The student recently solved this problem:\n
- Title: ${lastProblem.title}
- Platform: ${lastProblem.platform}
- Difficulty: ${lastProblem.difficulty}
- Tags: ${lastProblem.tags.join(', ')}

Use this context to provide relevant recommendations and explanations.`;
        }
        
        const prompt = `${context}\n\nStudent Query: ${message}\n\nProvide a helpful, concise, and engaging response. Include specific recommendations when applicable.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json(new ApiResponse(200, { response: text }, "AI response generated successfully"));
        
    } catch (error) {
        console.error('Gemini AI Error:', error);
        throw new ApiError(500, `AI service error: ${error.message || 'Failed to generate response'}`);
    }
});

export { chatWithAI };
