const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Save job description
router.post('/save', (req, res) => {
    try {
        const { title, description, company } = req.body;
        
        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Job description is required'
            });
        }

        // In a real app, save to database
        const jobData = {
            title: title || 'Untitled Job',
            description,
            company: company || 'Unknown Company',
            userId: req.userId,
            savedAt: new Date()
        };

        // For now, just return the data
        res.json({
            success: true,
            message: 'Job saved successfully',
            data: jobData
        });
    } catch (error) {
        console.error('Save job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save job'
        });
    }
});

// Get saved jobs
router.get('/saved', (req, res) => {
    try {
        // In a real app, fetch from database
        // For now, return empty array
        res.json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error('Get saved jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved jobs'
        });
    }
});

module.exports = router;