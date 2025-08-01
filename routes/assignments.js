const express = require('express');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all assignments for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { status, courseId, from, to } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (courseId) filter.courseId = courseId;
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(from);
      if (to) filter.dueDate.$lte = new Date(to);
    }
    const assignments = await Assignment.find(filter).sort({ dueDate: 1 });
    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
});

// Get a specific assignment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    res.json({
      success: true,
      data: { assignment }
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message
    });
  }
});

// Create a new assignment
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, title, description, type, dueDate, priority, status, progress, notes, tags, estimatedHours } = req.body;
    // Check if course exists and belongs to user
    const course = await Course.findOne({ _id: courseId, userId: req.user._id });
    if (!course) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course for this user'
      });
    }
    const assignment = new Assignment({
      userId: req.user._id,
      courseId,
      title,
      description,
      type,
      dueDate,
      priority,
      status,
      progress,
      notes,
      tags,
      estimatedHours
    });
    await assignment.save();
    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message
    });
  }
});

// Update an assignment
router.put('/:id', auth, async (req, res) => {
  try {
    const { courseId, title, description, type, dueDate, priority, status, progress, notes, tags, estimatedHours, actualHours } = req.body;
    // Check if assignment exists and belongs to user
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    // If courseId is being changed, check if new course exists
    if (courseId && courseId !== assignment.courseId.toString()) {
      const course = await Course.findOne({ _id: courseId, userId: req.user._id });
      if (!course) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course for this user'
        });
      }
    }
    Object.assign(assignment, {
      courseId,
      title,
      description,
      type,
      dueDate,
      priority,
      status,
      progress,
      notes,
      tags,
      estimatedHours,
      actualHours
    });
    await assignment.save();
    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
});

// Delete an assignment
router.delete('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
});

// Get assignment statistics for the user
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id });
    const stats = {
      total: assignments.length,
      completed: assignments.filter(a => a.status === 'completed').length,
      pending: assignments.filter(a => a.status === 'pending').length,
      inProgress: assignments.filter(a => a.status === 'in-progress').length,
      overdue: assignments.filter(a => a.status === 'overdue').length
    };
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment statistics',
      error: error.message
    });
  }
});

module.exports = router;