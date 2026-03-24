const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const generateFallbackFeedback = (resumeText) => {
    const words = String(resumeText || '').trim().split(/\s+/).filter(Boolean);
    const length = words.length;
    const hasEmail = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(resumeText || '');
    const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(resumeText || '');
    const hasProjects = /project|projects/i.test(resumeText || '');
    const hasSkills = /skills?|javascript|typescript|react|node|python|java|sql|aws|docker/i.test(resumeText || '');
    const hasExperience = /experience|intern|work/i.test(resumeText || '');

    const suggestions = [];
    if (length < 180) suggestions.push('- Add more detail on projects, outcomes, and measurable impact.');
    if (!hasEmail || !hasPhone) suggestions.push('- Include complete contact details (professional email and phone number).');
    if (!hasSkills) suggestions.push('- Add a dedicated technical skills section with tools and frameworks.');
    if (!hasProjects) suggestions.push('- Add 2-3 project highlights with tech stack and results.');
    if (!hasExperience) suggestions.push('- Add internship/work experience bullets focused on achievements.');
    if (suggestions.length === 0) suggestions.push('- Resume structure looks solid; refine bullets with stronger action verbs and quantifiable outcomes.');

    return [
        'AI service is currently rate-limited, so this is a local fallback analysis.',
        '',
        `Resume length: ~${length} words.`,
        '',
        'Suggestions:',
        ...suggestions
    ].join('\n');
};

/**
 * AI: Analyze Resume
 * @route POST /api/ai/analyze-resume
 * @access Public
 */
router.post('/analyze-resume', async (req, res) => {
    const resumeText = req.body?.resumeText;
    try {
        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'AI service not configured' });
        }

        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
        const response = await model.generateContent(
            `Analyze this resume and provide constructive feedback and suggestions for improvement. Be concise and professional.\n\nResume:\n${resumeText}`
        );

        const feedback = response?.response?.text?.() || '';
        return res.json({ feedback });
    } catch (error) {
        console.error('AI Error:', error);

        const message = String(error?.message || 'Unknown AI error');
        if (message.includes('429') || message.toLowerCase().includes('quota')) {
            return res.status(200).json({
                feedback: generateFallbackFeedback(resumeText),
                warning: 'Gemini quota exceeded. Returned fallback analysis.'
            });
        }

        return res.status(500).json({ error: 'Failed to analyze resume: ' + message });
    }
});

/**
 * AI: Match Resume to Internship
 * @route POST /api/ai/match-resume
 * @access Public
 */
router.post('/match-resume', async (req, res) => {
    try {
        const { resumeText, internshipTitle, internshipDescription, requiredSkills } = req.body;
        
        if (!resumeText || !internshipTitle) {
            return res.status(400).json({ error: 'Resume text and internship details required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'AI service not configured' });
        }

        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const skillsStr = Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills || '';
        
        const prompt = `Rate this resume against the internship description on a scale of 0-100. Provide a match score and brief justification.

Internship: ${internshipTitle}
Description: ${internshipDescription}
Required Skills: ${skillsStr}

Resume:
${resumeText}

Respond in JSON format: {"score": <number>, "justification": "<string>"}`;

        const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
        const response = await model.generateContent(prompt);
        const responseText = response.response.text();
        
        // Try to parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return res.json(result);
        }

        // If no JSON found, return generic response
        res.json({ score: 50, justification: 'Unable to parse AI response' });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to match resume: ' + error.message });
    }
});

module.exports = router;
