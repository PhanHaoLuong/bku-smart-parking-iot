import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectToDatabase } from './config/db.js';
import { seedDemoData } from './utils/seed.util.js';

import authRoute from './routes/auth.route.js';
import parkingHistoryRoute from './routes/parkinghistory.route.js';
import billingRoute from './routes/billing.route.js';
import iotRoute from './routes/iot.route.js';
import monitoringRoute from './routes/monitoring.route.js';
import signageRoute from './routes/signage.route.js';
import demoRoute from './routes/demo.route.js';
import gateRoute from './routes/gate.route.js';


const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Backend is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/apiv1/auth', authRoute);
app.use('/apiv1/parking-history', parkingHistoryRoute);
app.use('/apiv1/iot', iotRoute);
app.use('/apiv1/billing', billingRoute);
app.use('/apiv1/monitoring', monitoringRoute);
app.use('/apiv1/signage', signageRoute);
app.use('/apiv1/demo', demoRoute);
app.use('/apiv1/gates', gateRoute);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

const startServer = async () => {
  await connectToDatabase();
  await seedDemoData();

  app.listen(PORT, () => {
    console.log('Server listening on http://localhost:'.concat(PORT));
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
