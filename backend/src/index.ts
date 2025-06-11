import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import collectionRoutes from './routes/collection';
import wantlistRoutes from './routes/wantlist';
import publishersRoutes from './routes/publishers';
import tapesRoutes from './routes/tapes';
import boxsetsRoutes from './routes/boxsets';
import { notFoundHandler, errorHandler } from './middleware/error';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/wantlist', wantlistRoutes);
app.use('/api/publishers', publishersRoutes);
app.use('/api/tapes', tapesRoutes);
app.use('/api/boxsets', boxsetsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} 