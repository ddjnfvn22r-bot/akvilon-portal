import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import apartmentRoutes from './routes/apartments.routes';
import defectRoutes from './routes/defects.routes';
import userRoutes from './routes/users.routes';
import chatRoutes from './routes/chats.routes';
import paymentRoutes from './routes/payments.routes';
import inspectionRoutes from './routes/inspections.routes';
import finishingRoutes from './routes/finishing.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export { logger };

const app: Express = express();
const httpServer = createServer(app);
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/apartments', authMiddleware, apartmentRoutes);
app.use('/api/v1/defects', authMiddleware, defectRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/chats', authMiddleware, chatRoutes);
app.use('/api/v1/payments', authMiddleware, paymentRoutes);
app.use('/api/v1/inspections', authMiddleware, inspectionRoutes);
app.use('/api/v1/finishing', authMiddleware, finishingRoutes);

// Swagger Documentation
app.get('/api-docs', (req: Request, res: Response) => {
  res.json({
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      apartments: '/api/v1/apartments',
      defects: '/api/v1/defects',
      users: '/api/v1/users',
      chats: '/api/v1/chats',
      payments: '/api/v1/payments',
      inspections: '/api/v1/inspections',
      finishing: '/api/v1/finishing',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO event handlers
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Chat events
  socket.on('join-chat', (chatId: string) => {
    socket.join(`chat-${chatId}`);
    logger.info(`User joined chat: ${chatId}`);
  });

  socket.on('send-message', (data: any) => {
    io.to(`chat-${data.chatId}`).emit('new-message', data);
  });

  socket.on('typing', (data: any) => {
    io.to(`chat-${data.chatId}`).emit('user-typing', data);
  });

  // Notifications
  socket.on('subscribe-notifications', (userId: string) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.BACKEND_PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Socket.IO connected at http://localhost:${PORT}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
