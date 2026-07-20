import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

const app = express();

// Middlewares
app.use(cors({
  origin: true, // You may want to restrict this in production
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(generalLimiter);

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
import notificationRoutes from './routes/notificationRoutes';

// Routes will be added here
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/file-types', fileTypeRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).json({ error: 'Internal Server Error', message: err.message, stack: err.stack });
  }
});

export default app;
