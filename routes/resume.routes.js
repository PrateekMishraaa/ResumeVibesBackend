const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new resume
router.post('/', resumeController.createResume);

// Get all resumes for logged-in user
router.get('/', resumeController.getUserResumes);

// Get single resume
router.get('/:id', resumeController.getResume);

// Update resume
router.put('/:id', resumeController.updateResume);

// Delete resume
router.delete('/:id', resumeController.deleteResume);

// Optimize resume with AI
router.post('/:id/optimize', resumeController.optimizeResume);

// Analyze resume (without optimization)
router.get('/:id/analyze', resumeController.analyzeResume);

module.exports = router;