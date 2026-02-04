const express = require('express');
const dotenv = require('dotenv');
dotenv.config()
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS 配置 - 开发环境允许所有来源
const corsOptions = {
    origin: function (origin, callback) {
        // 开发环境：允许所有来源
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // 生产环境：只允许特定域名
        const allowedOrigins = [
            process.env.CLIENT_URL,
            'http://localhost:5173',
            'http://localhost:3000'
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// 处理预检请求
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/resumes', require('./routes/resume.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        cors: {
            allowedOrigins: corsOptions.origin.toString(),
            method: req.method,
            origin: req.headers.origin
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    // 处理 CORS 错误
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS Error: Origin not allowed'
        });
    }
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});