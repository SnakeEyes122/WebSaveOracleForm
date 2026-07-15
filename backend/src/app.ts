import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Oracle Forms Repo API is running' });
});

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import systemRoutes from './routes/systemRoutes';
import fileTypeRoutes from './routes/fileTypeRoutes';
import fileRoutes from './routes/fileRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import auditLogRoutes from './routes/auditLogRoutes';

// Routes will be added here
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/file-types', fileTypeRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
