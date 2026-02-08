import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
// Use 'mongodb' as the host which matches the service name in docker-compose.yml
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/portfolio_db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get('/health', (req, res) => {
    res.json({ status: 'Portfolio service is running' });
});

app.use('/api', apiRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Portfolio Service listening on port ${PORT}`);
});