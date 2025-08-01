const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // You can add more statistics here as needed
    const stats = {
      totalAssignments: 0, // Will be calculated from assignments
      completedAssignments: 0,
      pendingAssignments: 0,
      overdueAssignments: 0,
      totalCourses: 0, // Will be calculated from courses
      lastLogin: user.lastLogin,
      memberSince: user.createdAt
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

// Update user settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: { ...req.user.settings, ...settings } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
});

module.exports = router; 