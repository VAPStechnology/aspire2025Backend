import express from 'express';
import http from 'http'; // ✅ Correctly imported
import path from 'path';
import { fileURLToPath } from 'url';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';  // Added for logging

// Routes
import indexRouter from './routes/index.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';
import agreementRoutes from './routes/agreement.routes.js';

// Utils
import connectDB from './config/dbConnect.js';
import ApiError from './utils/ApiError.js';
import { initSocket } from './socket.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load environment variables
configDotenv({ path: './config/.env' });

// Connect to MongoDB
connectDB();

// CORS Configuration for credentials
const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true); // Accept any origin
    },
    credentials: true, // Allow cookies, authorization headers, etc.              // Allow credentials (cookies, etc.)
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging Middleware (for debugging and requests)
app.use(morgan('dev')); // Logs all requests in dev format

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRoutes);
app.use('/api/agreement', agreementRoutes)


// 404 handler (for invalid routes)
app.use((req, res, next) => {
    const error = new ApiError('Not Found', 404);
    next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message,
    });
});

// Create HTTP server and attach socket
const server = http.createServer(app);
initSocket(server); // Attach WebSocket functionality


// Graceful Shutdown Handling
const gracefulShutdown = () => {
    console.log('Gracefully shutting down...');
    server.close(() => {
        console.log('Closed HTTP server');
        process.exit(0);
    });

    // Close other connections like database or WebSocket if needed
    // Example: closeDbConnection();
};

// Catch termination signals (for graceful shutdown)
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default app;
