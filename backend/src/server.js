import 'dotenv/config'; // Replaces require('dotenv').config();
import express from 'express';
import cors from 'cors';
import authRoute from './routes/auth.route.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Backend is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/apiv1/auth', authRoute);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
