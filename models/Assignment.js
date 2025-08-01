const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Assignment', 'Project', 'Exam', 'Quiz', 'Presentation', 'Report', 'Other'],
    default: 'Assignment'
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ userId: 1, dueDate: 1 });
assignmentSchema.index({ userId: 1, status: 1 });
assignmentSchema.index({ userId: 1, courseId: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Pre-save middleware to update status based on due date
assignmentSchema.pre('save', function(next) {
  if (this.dueDate < new Date() && this.status !== 'completed') {
    this.status = 'overdue';
  }
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema); 