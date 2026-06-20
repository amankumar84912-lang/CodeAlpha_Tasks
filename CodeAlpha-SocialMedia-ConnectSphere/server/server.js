import dotenv from 'dotenv';
dotenv.config(); // Must run first — populates process.env before any other module reads it

import { validateEnv } from './config/env.js';
validateEnv(); // Crash immediately if any required variable is missing or invalid

import express from 'express';
import cors from 'cors';
import connectDB from './utils/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API endpoints
app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/', (_req, res) =>
  res.json({ success: true, data: { message: 'ConnectSphere API v2', version: '2.0.0' } })
);

app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    data: { status: 'OK', version: '2.0.0', env: process.env.NODE_ENV },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// ── Error Handling ────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ConnectSphere v2 running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   CORS origin  : ${process.env.CLIENT_URL}`);
  console.log(`   Health       : http://localhost:${PORT}/api/health`);
});

export default app;
