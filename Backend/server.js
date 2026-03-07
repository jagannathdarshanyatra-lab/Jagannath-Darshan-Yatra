const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL 
      ? [process.env.FRONTEND_URL, 'https://jagannathdarshanyatra.com', 'https://www.jagannathdarshanyatra.com', 'https://admin.jagannathdarshanyatra.com', 'https://jagannath-darshan-yatra.vercel.app', 'https://jagannath-darshan-yatra-admin1.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:8081']
      : ['https://jagannathdarshanyatra.com', 'https://www.jagannathdarshanyatra.com', 'https://admin.jagannathdarshanyatra.com', 'https://jagannath-darshan-yatra.vercel.app', 'https://jagannath-darshan-yatra-admin1.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  })
);

app.use(express.json());
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
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
