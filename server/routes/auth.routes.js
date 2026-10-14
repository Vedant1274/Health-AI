const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  age: z.number().int().min(1, 'Age must be at least 1').max(150),
  sex: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Sex must be male, female, or other' }),
  }),
  phone: z.string().optional().default(''),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Generate JWT token for a user.
 */
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /auth/register
 * Create a new user account.
 */
router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Create user
    const user = new User({
      name: validated.name,
      email: validated.email,
      passwordHash,
      age: validated.age,
      sex: validated.sex,
      phone: validated.phone,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
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

    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration. Please try again.',
    });
  }
});

/**
 * POST /auth/login
 * Authenticate a user and return a JWT token.
 */
router.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);

    // Find user by email (include passwordHash for comparison)
    const user = await User.findOne({ email: validated.email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect.',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
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

    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login. Please try again.',
    });
  }
});

module.exports = router;
