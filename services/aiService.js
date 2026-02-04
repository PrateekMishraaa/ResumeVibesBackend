const OpenAI = require('openai');

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async optimizeResume(resumeData, jobDescription) {
        try {
            console.log('Starting resume optimization...');
            
            const prompt = this.createOptimizationPrompt(resumeData, jobDescription);
            
            console.log('Sending request to OpenAI...');
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo", // Using gpt-3.5-turbo for cost efficiency
                messages: [
                    {
                        role: "system",
                        content: "You are a professional resume optimizer and career coach. Provide responses in valid JSON format only."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            });

            console.log('OpenAI response received');
            const result = JSON.parse(response.choices[0].message.content);
            
            return {
                optimizedResume: result.optimizedResume || resumeData,
                score: result.score || 0,
                suggestions: result.suggestions || [],
                keywords: result.keywords || []
            };
        } catch (error) {
            console.error('AI Optimization Error:', error);
            
            // Fallback response if AI fails
            return {
                optimizedResume: resumeData,
                score: 50,
                suggestions: [{
                    section: "general",
                    original: "",
                    optimized: "",
                    reason: "AI service temporarily unavailable. Please try again."
                }],
                keywords: []
            };
        }
    }

    createOptimizationPrompt(resumeData, jobDescription) {
        return `
        Analyze this resume and job description, then provide optimization suggestions.
        
        RESUME DATA:
        ${JSON.stringify(resumeData, null, 2)}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Return a JSON object with this structure:
        {
            "optimizedResume": { 
                "summary": "Optimized summary here",
                "experience": ["Optimized bullet points"],
                "skills": ["Optimized skills list"]
            },
            "score": 85,
            "suggestions": [
                {
                    "section": "summary",
                    "original": "Original text",
                    "optimized": "Optimized text",
                    "reason": "Improvement reason"
                }
            ],
            "keywords": ["keyword1", "keyword2"]
        }
        
        Important: Only return valid JSON, no other text.
        `;
    }

    async analyzeJobDescription(jobDescription) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Extract key information from job descriptions. Return JSON only."
                    },
                    {
                        role: "user",
                        content: `Analyze this job description: ${jobDescription}`
                    }
                ],
                temperature: 0.5,
                max_tokens: 500
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Job Analysis Error:', error);
            return {
                skills: [],
                requirements: [],
                keywords: [],
                summary: "Analysis unavailable"
            };
        }
    }

    async generateResumeFromScratch(userInfo, jobDescription) {
        // Implementation for generating resume from scratch
        // This can be implemented later
        return {
            message: "Feature coming soon",
            userInfo,
            jobDescription
        };
    }
}

module.exports = new AIService();