const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const AIService = require('../services/aiService');

// All routes require authentication
router.use(authMiddleware);

// Analyze job description
router.post('/analyze-job', async (req, res) => {
    try {
        const { jobDescription } = req.body;
        
        if (!jobDescription) {
            return res.status(400).json({
                success: false,
                message: 'Job description is required'
            });
        }

        const analysis = await AIService.analyzeJobDescription(jobDescription);
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate resume from scratch
router.post('/generate-resume', async (req, res) => {
    try {
        const { userInfo, jobDescription } = req.body;
        
        if (!userInfo || !jobDescription) {
            return res.status(400).json({
                success: false,
                message: 'User info and job description are required'
            });
        }

        const resume = await AIService.generateResumeFromScratch(userInfo, jobDescription);
        
        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;