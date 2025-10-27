const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  start_time: Date,
  end_time: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  status: { 
    type: String, 
    enum: ['Booked', 'Cancelled', 'Completed'], 
    default: 'Booked' 
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
