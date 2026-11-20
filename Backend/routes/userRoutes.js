const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_123456';
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    secret,
    { expiresIn: '7d' }
  );
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please provide username, email and password' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ msg: 'Email is already registered' });
      }
      return res.status(400).json({ msg: 'Username is already taken' });
    }

    const user = new User({
      username,
      email,
      password,
      fullName: fullName || username,
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({
      msg: 'User registered successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.username,
        title: user.title,
        bio: user.bio,
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      msg: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.username,
        title: user.title,
        bio: user.bio,
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { fullName, title, bio, username } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ msg: 'Username is already taken' });
      }
      user.username = username;
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        title: user.title,
        bio: user.bio,
      }
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ msg: 'Server error updating profile' });
  }
});

// Get all users (team members)
router.get('/team-members', async (req, res) => {
  try {
    const users = await User.find().select('username email fullName title');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user by Email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
