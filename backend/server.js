import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenseRoutes.js';
import statementRoutes from './routes/statementRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://finance-tracker-frontend.vercel.app', // Example Vercel URL
        process.env.FRONTEND_URL // Allow custom env variable
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// Routes
app.use('/api', expenseRoutes);
app.use('/api', statementRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Finance API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
});
