import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/config.js';
import api from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration - MUST be before other middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Helmet with relaxed settings for development
app.use(helmet({
  crossOriginResourcePolicy: false, // Tắt hoàn toàn để không block ảnh từ domain khác
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Disable CSP in development
}));

app.use(express.json());
app.use(morgan('dev'));

// Serve static files (uploaded images) - Don't set CORS here, already handled by cors middleware above
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    // Only set cache control, CORS is already handled by the cors middleware
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

app.use('/api/v1', api);


app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal error' });
});

export default app;
