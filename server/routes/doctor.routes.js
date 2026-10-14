const express = require('express');
const { z } = require('zod');
const { auth } = require('../middleware/auth');
const { searchNearbyDoctors } = require('../services/placesService');

const router = express.Router();

// Validation schema
const nearbySchema = z.object({
  condition: z.string().min(1, 'Condition is required').max(200),
  city: z.string().max(100).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
}).refine(data => data.city || (data.lat && data.lng), {
  message: 'Please provide either a city/pincode or your coordinates (lat/lng)',
});

/**
 * POST /api/doctors/nearby
 * Search for doctors/hospitals near a location using Google Places API.
 * This is a live external API call — no local Doctor collection.
 */
router.post('/nearby', auth, async (req, res) => {
  try {
    const validated = nearbySchema.parse(req.body);

    const results = await searchNearbyDoctors({
      condition: validated.condition,
      city: validated.city,
      lat: validated.lat,
      lng: validated.lng,
    });

    res.json({
      message: 'Search completed',
      count: results.length,
      doctors: results,
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

    console.error('Doctor search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message || 'Failed to search for doctors. Please try again.',
    });
  }
});

module.exports = router;
