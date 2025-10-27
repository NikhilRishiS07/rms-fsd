const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: String,
  status: { 
    type: String, 
    enum: ['Available', 'Unavailable'], 
    default: 'Available' 
  },
  capacity: Number,
  availability_start: String, // Format: '08:00:00'
  availability_end: String,   // Format: '18:00:00'
  equipment: String,
  location: String,
});

module.exports = mongoose.model('Resource', ResourceSchema);
