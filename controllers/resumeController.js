const Resume = require('../models/Resume');
const AIService = require('../services/aiService');

exports.createResume = async (req, res) => {
    try {
        console.log('Creating resume for user:', req.userId);
        
        const resumeData = {
            ...req.body,
            user: req.userId
        };

        // Validate required fields
        if (!resumeData.title) {
            return res.status(400).json({
                success: false,
                message: 'Resume title is required'
            });
        }

        const resume = new Resume(resumeData);
        await resume.save();

        console.log('Resume created successfully:', resume._id);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: resume
        });
    } catch (error) {
        console.error('Create resume error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create resume'
        });
    }
};

exports.getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.userId })
            .sort({ updatedAt: -1 })
            .select('-optimizedContent -aiSuggestions'); // Exclude large fields for list view

        res.json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        console.error('Get user resumes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resumes'
        });
    }
};

exports.getResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or access denied'
            });
        }

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resume'
        });
    }
};

exports.updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const resume = await Resume.findOneAndUpdate(
            { _id: id, user: req.userId },
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or access denied'
            });
        }

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: resume
        });
    } catch (error) {
        console.error('Update resume error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update resume'
        });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;

        const resume = await Resume.findOneAndDelete({
            _id: id,
            user: req.userId
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or access denied'
            });
        }

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete resume'
        });
    }
};

exports.optimizeResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { jobDescription } = req.body;

        console.log('Optimizing resume:', id);
        
        if (!jobDescription) {
            return res.status(400).json({
                success: false,
                message: 'Job description is required'
            });
        }

        const resume = await Resume.findOne({
            _id: id,
            user: req.userId
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or access denied'
            });
        }

        console.log('Calling AI service for optimization...');
        
        // Call AI service to optimize resume
        const optimizationResult = await AIService.optimizeResume(
            resume.originalContent || resume,
            jobDescription
        );

        console.log('AI optimization completed, updating resume...');

        // Update resume with optimized content
        resume.optimizedContent = optimizationResult.optimizedResume;
        resume.jobDescription = jobDescription;
        resume.optimizationScore = optimizationResult.score;
        resume.aiSuggestions = optimizationResult.suggestions;
        resume.keywords = optimizationResult.keywords;
        resume.updatedAt = Date.now();

        await resume.save();

        res.json({
            success: true,
            message: 'Resume optimized successfully',
            data: resume
        });
    } catch (error) {
        console.error('Optimize resume error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to optimize resume'
        });
    }
};

exports.analyzeResume = async (req, res) => {
    try {
        const { id } = req.params;
        
        const resume = await Resume.findOne({
            _id: id,
            user: req.userId
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Get suggestions without optimization
        const suggestions = await AIService.analyzeJobDescription(
            resume.jobDescription || 'No job description provided'
        );
        
        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Analyze resume error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};