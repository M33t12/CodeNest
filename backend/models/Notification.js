// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['resource_submitted','resource_approved','resource_rejected'], 
    required: true 
  },
  title: String,
  message: String,
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  link: String,     // e.g., /resources/:slug or /dashboard/reviews
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
