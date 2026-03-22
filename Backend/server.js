const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { v4: uuidv4 } = require('uuid');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();



// Request ID Middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Security Middlewares
app.use(helmet());

// Logging with Morgan & Request ID
morgan.token('id', (req) => req.id);
app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms'));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', globalLimiter);
app.use(
  cors({
    origin: process.env.FRONTEND_URL 
      ? [process.env.FRONTEND_URL, 'https://jagannathdarshanyatra.com', 'https://www.jagannathdarshanyatra.com', 'https://admin.jagannathdarshanyatra.com', 'https://jagannath-darshan-yatra.vercel.app', 'https://jagannath-darshan-yatra-admin1.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:8081']
      : ['https://jagannathdarshanyatra.com', 'https://www.jagannathdarshanyatra.com', 'https://admin.jagannathdarshanyatra.com', 'https://jagannath-darshan-yatra.vercel.app', 'https://jagannath-darshan-yatra-admin1.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  })
);

// Payload limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));

app.use('/api/states', require('./routes/stateRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/ota/webhook', require('./routes/otaWebhookRoutes'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jagannath Darshan Yatra API is running' });
});
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});



app.use((err, req, res, next) => {
  console.error(`[${req.id || 'N/A'}] Error:`, err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
    requestId: req.id,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
