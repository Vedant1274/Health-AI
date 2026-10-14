const express = require('express');
const { z } = require('zod');
const { auth } = require('../middleware/auth');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Validation schema for creating appointments
const createAppointmentSchema = z.object({
  date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: 'Please provide a valid date',
  }),
  placeId: z.string().min(1, 'Place ID is required'),
  placeName: z.string().min(1, 'Place name is required'),
  specialty: z.string().optional().default(''),
  address: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  notes: z.string().max(500).optional().default(''),
});

/**
 * GET /api/appointments
 * Get the current user's appointments.
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { userId: req.userId };
    if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Failed to fetch appointments',
      message: 'An error occurred while fetching your appointments.',
    });
  }
});

/**
 * POST /api/appointments
 * Create a new appointment with a place snapshot from Google Places.
 */
router.post('/', auth, async (req, res) => {
  try {
    const validated = createAppointmentSchema.parse(req.body);

    const appointment = new Appointment({
      userId: req.userId,
      date: new Date(validated.date),
      placeId: validated.placeId,
      placeName: validated.placeName,
      specialty: validated.specialty,
      address: validated.address,
      phone: validated.phone,
      notes: validated.notes,
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
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

    console.error('Create appointment error:', error);
    res.status(500).json({
      error: 'Failed to create appointment',
      message: 'An error occurred while creating the appointment.',
    });
  }
});

module.exports = router;
