const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/theatre_ticket_db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import Routes
const showRoutes = require('./routes/shows');
const ticketRoutes = require('./routes/tickets');
const customerRoutes = require('./routes/customers');

// Use Routes
app.use('/api/shows', showRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/customers', customerRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Theatre Ticket Management System API',
    endpoints: {
      shows: '/api/shows',
      tickets: '/api/tickets',
      customers: '/api/customers'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});