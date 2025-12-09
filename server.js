const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const intakeRoutes = require('./routes/intake');
const familyRoutes = require('./routes/family');
const notificationRoutes = require('./routes/notifications');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'MedGuardian API is running',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Serve static files (HTML, CSS, JS) - must be after API routes
app.use(express.static(__dirname));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Start Server with automatic port selection
const PORT = process.env.PORT || 5000;

const startServer = (port) => {
    const server = app.listen(port)
        .on('listening', () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📍 API available at http://localhost:${port}/api`);
            console.log(`🌐 Frontend available at http://localhost:${port}/index.html`);
        })
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`⚠️  Port ${port} is already in use, trying port ${port + 1}...`);
                startServer(port + 1);
            } else {
                console.error('❌ Server Error:', err);
                process.exit(1);
            }
        });
};

startServer(PORT);
