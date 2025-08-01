const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#1e7e34',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  description: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    min: 1,
    max: 6
  },
  semester: {
    type: String,
    trim: true
  },
  year: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for user and course code
courseSchema.index({ userId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema); 