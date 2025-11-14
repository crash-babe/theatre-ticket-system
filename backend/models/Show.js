const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 100
  },
  availableSeats: {
    type: Number,
    required: true
  },
  venue: {
    type: String,
    default: 'Medallion Theatre'
  }
}, {
  timestamps: true
});

// Initialize availableSeats to totalSeats if not set
showSchema.pre('save', function(next) {
  if (this.isNew && !this.availableSeats) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

module.exports = mongoose.model('Show', showSchema);