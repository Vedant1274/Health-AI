const express = require('express');
const { z } = require('zod');
const { auth } = require('../middleware/auth');
const SymptomCheck = require('../models/SymptomCheck');
const { analyzeSymptoms } = require('../services/ai/symptomService');

const router = express.Router();

// Validation schema
const symptomSchema = z.object({
  description: z.string()
    .min(10, 'Please describe your symptoms in more detail (at least 10 characters)')
    .max(2000, 'Description is too long (max 2000 characters)'),
});

/**
 * POST /api/symptoms
 * Submit symptoms for AI analysis.
 */
router.post('/', auth, async (req, res) => {
  try {
    const validated = symptomSchema.parse(req.body);

    // Call AI service
    const aiResponse = await analyzeSymptoms(validated.description);

    // Save to database
    const symptomCheck = new SymptomCheck({
      userId: req.userId,
      description: validated.description,
      aiResponse,
    });

    await symptomCheck.save();

    res.status(201).json({
      message: 'Symptoms analyzed successfully',
      symptomCheck: {
        _id: symptomCheck._id,
        description: symptomCheck.description,
        aiResponse: symptomCheck.aiResponse,
        createdAt: symptomCheck.createdAt,
      },
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

    console.error('Symptom analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'Failed to analyze symptoms. Please try again.',
    });
  }
});

/**
 * GET /api/symptoms/history
 * Get the current user's symptom check history.
 */
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [checks, total] = await Promise.all([
      SymptomCheck.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SymptomCheck.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      checks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Symptom history error:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: 'An error occurred while fetching your symptom history.',
    });
  }
});

module.exports = router;
