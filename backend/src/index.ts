import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import scanEventRoutes from './routes/scanEvent.routes.js';
import templateRoutes from './routes/template.routes.js';

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Backend running');
});

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/scan-events', scanEventRoutes);
app.use('/templates', templateRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
