const { GoogleGenerativeAI } = require('@google/generative-ai');

const gemini = new GoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Score and analyze a resume against internship requirements
 * @param {string} resumeText - Extracted resume text
 * @param {Object} internship - Internship object with title, description, requiredSkills
 * @returns {Promise<Object>} Score and feedback from Gemini AI
 */
exports.analyzeResume = async (resumeText, internship) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in environment variables');
        }

        const prompt = `
You are an internship advisor. Analyze the following student resume against the internship position requirements and provide:
1. A score from 0-100
2. Key strengths matching the role
3. Areas for improvement
4. Overall recommendation (strong match, good match, moderate match, or weak match)

Resume:
${resumeText}

Internship Position:
Title: ${internship.title}
Description: ${internship.description}
Required Skills: ${internship.requiredSkills?.join(', ') || 'Not specified'}

Provide the response in the following JSON format:
{
  "score": <number>,
  "strengths": [<list of strengths>],
  "improvements": [<list of improvements>],
  "recommendation": "<strong match|good match|moderate match|weak match>",
  "summary": "<brief summary>"
}`;

        const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        
        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse AI response');
        }
        
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
    } catch (err) {
        console.error('Error analyzing resume with Gemini:', err);
        throw new Error('Failed to analyze resume: ' + err.message);
    }
};

/**
 * Generate interview questions based on resume and internship
 * @param {string} resumeText - Extracted resume text
 * @param {Object} internship - Internship object
 * @returns {Promise<string[]>} Array of interview questions
 */
exports.generateInterviewQuestions = async (resumeText, internship) => {
    try {
        const prompt = `
Generate 5 thoughtful interview questions for a student applying to the "${internship.title}" internship position.
Base the questions on their resume and the internship requirements.

Resume:
${resumeText}

Internship Requirements:
${internship.requiredSkills?.join(', ') || 'Not specified'}

Return only the questions as a JSON array of strings, nothing else.`;

        const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        
        const questions = JSON.parse(text);
        return questions;
    } catch (err) {
        console.error('Error generating interview questions:', err);
        throw new Error('Failed to generate questions: ' + err.message);
    }
};
