const express = require('express');
const { z } = require('zod');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  age: z.number().int().min(1).max(150).optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

/**
 * GET /api/profile
 * Get the current user's profile.
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Profile could not be found.',
      });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'An error occurred while fetching your profile.',
    });
  }
});

/**
 * PUT /api/profile
 * Update the current user's profile.
 */
router.put('/', auth, async (req, res) => {
  try {
    const validated = updateProfileSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: validated },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Profile could not be found.',
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating your profile.',
    });
  }
});

module.exports = router;
