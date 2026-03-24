const Application = require('../models/Application');
const Internship = require('../models/Internship');
const { analyzeResume, generateInterviewQuestions } = require('../utils/geminiAI');
const { extractPdfText } = require('../utils/pdfExtractor');

/**
 * Analyze an application's resume with Gemini AI
 * @route POST /api/applications/:applicationId/analyze
 * @access Private (Admin/Faculty)
 */
exports.analyzeApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Find the application with populated references
        const application = await Application.findById(applicationId)
            .populate('student', 'name email resume department')
            .populate('internship', 'title description requiredSkills');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check authorization (only admin/faculty can analyze)
        if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to analyze applications' });
        }

        // Get resume text (already extracted or use existing)
        let resumeText = application.resumeText;
        if (!resumeText && req.file) {
            // If file uploaded in request, extract from it
            resumeText = await extractPdfText(req.file.buffer);
        }

        if (!resumeText) {
            return res.status(400).json({ message: 'No resume text found for analysis' });
        }

        // Analyze with Gemini
        const analysis = await analyzeResume(resumeText, {
            title: application.internship.title,
            description: application.internship.description,
            requiredSkills: application.internship.requiredSkills
        });

        // Update application with AI analysis
        application.aiScore = analysis.score;
        application.aiFeedback = analysis.summary;
        application.aiAnalysis = analysis;
        await application.save();

        res.json({
            message: 'Application analyzed successfully',
            application,
            analysis
        });
    } catch (err) {
        console.error('Error analyzing application:', err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
};

/**
 * Generate interview questions for an application
 * @route POST /api/applications/:applicationId/interview-questions
 * @access Private (Admin/Faculty)
 */
exports.generateInterviewQuestionsForApp = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate('internship', 'title description requiredSkills');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (!application.resumeText) {
            return res.status(400).json({ message: 'No resume text found' });
        }

        const questions = await generateInterviewQuestions(application.resumeText, {
            title: application.internship.title,
            description: application.internship.description,
            requiredSkills: application.internship.requiredSkills
        });

        res.json({
            message: 'Interview questions generated successfully',
            questions
        });
    } catch (err) {
        console.error('Error generating interview questions:', err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
};

/**
 * Get AI analysis for an application
 * @route GET /api/applications/:applicationId/analysis
 * @access Private
 */
exports.getApplicationAnalysis = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({
            score: application.aiScore,
            feedback: application.aiFeedback,
            analysis: application.aiAnalysis
        });
    } catch (err) {
        console.error('Error retrieving analysis:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
