import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes import
import roomRoutes from './routes/roomroutes.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingroutes.js';
import paymentRoutes from './routes/paymentroutes.js'; // ✨ Payment route import

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Incoming Request Logger
app.use((req, res, next) => {
    console.log("🔥 Incoming Request:", req.method, req.url);
    next();
});

// Routes middleware
app.use('/api/rooms', roomRoutes);
app.use('/api/users', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes); // ✨ Payment route mount
// ES modules ke liye __dirname ka proper setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads folder ko static banana
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Test route
app.get('/', (req, res) => {
    res.send('HotelPro Backend is running successfully!');
});

// MongoDB Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('📦 Connected to MongoDB successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection error:', error.message);
    });