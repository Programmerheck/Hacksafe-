const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretcybersecuritykey12345!', {
    expiresIn: '24h',
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists',
      });
    }

    // Create user (first user is admin, otherwise role is assigned or user by default)
    const count = await User.countDocuments({});
    const assignedRole = count === 0 ? 'admin' : (role || 'user');

    const user = await User.create({
      username,
      email,
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Record a failed login attempt in logs
      const Log = require('../models/Log');
      await Log.create({
        sourceIP: req.ip || '127.0.0.1',
        hostname: 'hackersafe-auth',
        severity: 'warning',
        category: 'auth',
        message: `Failed login attempt for email: ${email}`,
        parsedDetails: { email, attemptStatus: 'failed' },
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Record a successful login attempt in logs
    const Log = require('../models/Log');
    await Log.create({
      sourceIP: req.ip || '127.0.0.1',
      hostname: 'hackersafe-auth',
      severity: 'info',
      category: 'auth',
      message: `Successful login for user: ${user.username}`,
      parsedDetails: { username: user.username, attemptStatus: 'success' },
    });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
