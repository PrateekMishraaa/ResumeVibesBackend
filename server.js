const express = require('express');
const dotenv = require('dotenv');
dotenv.config()
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Debug: Check if route files exist
console.log('🔍 Checking route files...');
const routeFiles = {
  'authRoutes': './routes/authRoutes.js',
  'resume.routes': './routes/resume.routes.js',
  'job.routes': './routes/job.routes.js',
  'ai.routes': './routes/ai.routes.js'
};

Object.entries(routeFiles).forEach(([name, filePath]) => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${name}: ${filePath} - EXISTS`);
  } else {
    console.log(`❌ ${name}: ${filePath} - MISSING`);
  }
});

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
            'https://cool-tartufo-bb5fd7.netlify.app/',
            'https://resumevibesbackend.onrender.com'
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

// Routes with error handling
try {
    // Check and load auth routes
    const authRoutesPath = path.join(__dirname, 'routes', 'authRoutes.js');
    if (fs.existsSync(authRoutesPath)) {
        app.use('/api/auth', require('./routes/authRoutes.js'));
        console.log('✅ Loaded auth routes');
    } else {
        console.log('⚠️  authRoutes.js not found, creating placeholder route');
        app.use('/api/auth', (req, res) => {
            res.status(501).json({ message: 'Auth routes not implemented yet' });
        });
    }
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
}

try {
    // Check and load resume routes
    const resumeRoutesPath = path.join(__dirname, 'routes', 'resume.routes.js');
    if (fs.existsSync(resumeRoutesPath)) {
        app.use('/api/resumes', require('./routes/resume.routes.js'));
        console.log('✅ Loaded resume routes');
    } else {
        console.log('⚠️  resume.routes.js not found, creating placeholder route');
        app.use('/api/resumes', (req, res) => {
            res.status(501).json({ message: 'Resume routes not implemented yet' });
        });
    }
} catch (error) {
    console.error('❌ Error loading resume routes:', error.message);
}

try {
    // Check and load job routes - THIS IS THE PROBLEMATIC ONE
    const jobRoutesPath = path.join(__dirname, 'routes', 'job.routes.js');
    if (fs.existsSync(jobRoutesPath)) {
        app.use('/api/jobs', require('./routes/job.routes.js'));
        console.log('✅ Loaded job routes');
    } else {
        console.log('⚠️  job.routes.js not found, creating placeholder route');
        app.use('/api/jobs', (req, res) => {
            res.status(501).json({ message: 'Job routes not implemented yet' });
        });
    }
} catch (error) {
    console.error('❌ Error loading job routes:', error.message);
    // Create a safe fallback
    app.use('/api/jobs', (req, res) => {
        res.json({ 
            message: 'Job routes placeholder',
            status: 'Routes will be implemented soon'
        });
    });
}

try {
    // Check and load AI routes
    const aiRoutesPath = path.join(__dirname, 'routes', 'ai.routes.js');
    if (fs.existsSync(aiRoutesPath)) {
        app.use('/api/ai', require('./routes/ai.routes.js'));
        console.log('✅ Loaded AI routes');
    } else {
        console.log('⚠️  ai.routes.js not found, creating placeholder route');
        app.use('/api/ai', (req, res) => {
            res.status(501).json({ message: 'AI routes not implemented yet' });
        });
    }
} catch (error) {
    console.error('❌ Error loading AI routes:', error.message);
}

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
        },
        routes: {
            auth: fs.existsSync(path.join(__dirname, 'routes', 'authRoutes.js')),
            resumes: fs.existsSync(path.join(__dirname, 'routes', 'resume.routes.js')),
            jobs: fs.existsSync(path.join(__dirname, 'routes', 'job.routes.js')),
            ai: fs.existsSync(path.join(__dirname, 'routes', 'ai.routes.js'))
        }
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'ResumeVibes Backend API',
        status: 'running',
        version: '1.0.0',
        documentation: '/api/health for system status'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedPath: req.originalUrl
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
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});