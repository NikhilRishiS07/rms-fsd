const mongoose = require('mongoose');

const UsedBySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
});

module.exports = mongoose.model('UsedBy', UsedBySchema);
