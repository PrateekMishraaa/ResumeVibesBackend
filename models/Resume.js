const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    originalContent: {
        personalInfo: {
            name: String,
            email: String,
            phone: String,
            location: String,
            linkedin: String,
            github: String
        },
        summary: String,
        experience: [{
            title: String,
            company: String,
            location: String,
            startDate: Date,
            endDate: Date,
            current: Boolean,
            description: [String]
        }],
        education: [{
            degree: String,
            institution: String,
            location: String,
            graduationDate: Date,
            gpa: String
        }],
        skills: [{
            category: String,
            items: [String]
        }],
        projects: [{
            title: String,
            description: String,
            technologies: [String]
        }]
    },
    optimizedContent: {
        type: Object,
        default: null
    },
    jobDescription: String,
    optimizationScore: {
        type: Number,
        min: 0,
        max: 100
    },
    aiSuggestions: [{
        section: String,
        original: String,
        optimized: String,
        reason: String
    }],
    keywords: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resume', resumeSchema);