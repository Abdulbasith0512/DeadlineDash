const express = require('express');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all courses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

// Get a specific course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
});

// Create a new course
router.post('/', auth, async (req, res) => {
  try {
    const { name, code, instructor, color, description, credits, semester, year } = req.body;

    // Check if course code already exists for this user
    const existingCourse = await Course.findOne({
      userId: req.user._id,
      code: code
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'A course with this code already exists'
      });
    }

    const course = new Course({
      userId: req.user._id,
      name,
      code,
      instructor,
      color,
      description,
      credits,
      semester,
      year
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
});

// Update a course
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, code, instructor, color, description, credits, semester, year } = req.body;

    // Check if course exists and belongs to user
    const existingCourse = await Course.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if new code conflicts with other courses
    if (code && code !== existingCourse.code) {
      const codeConflict = await Course.findOne({
        userId: req.user._id,
        code: code,
        _id: { $ne: req.params.id }
      });

      if (codeConflict) {
        return res.status(400).json({
          success: false,
          message: 'A course with this code already exists'
        });
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        instructor,
        color,
        description,
        credits,
        semester,
        year
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
});

// Delete a course
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has assignments
    const assignmentCount = await Assignment.countDocuments({
      courseId: req.params.id,
      userId: req.user._id
    });

    if (assignmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course. It has ${assignmentCount} assignment(s) associated with it.`
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
});

// Get course statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const assignments = await Assignment.find({
      courseId: req.params.id,
      userId: req.user._id
    });

    const stats = {
      totalAssignments: assignments.length,
      completedAssignments: assignments.filter(a => a.status === 'completed').length,
      pendingAssignments: assignments.filter(a => a.status === 'pending').length,
      inProgressAssignments: assignments.filter(a => a.status === 'in-progress').length,
      overdueAssignments: assignments.filter(a => a.status === 'overdue').length,
      completionRate: assignments.length > 0 
        ? Math.round((assignments.filter(a => a.status === 'completed').length / assignments.length) * 100)
        : 0
    };

    res.json({
      success: true,
      data: {
        course,
        stats
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics',
      error: error.message
    });
  }
});

module.exports = router; 