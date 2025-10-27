const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  pwd_hash: String,
  role: { 
    type: String, 
    enum: ['Admin', 'Faculty', 'Staff', 'Student'], 
    required: true 
  },
});

module.exports = mongoose.model('User', UserSchema);
