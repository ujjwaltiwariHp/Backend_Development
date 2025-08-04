const express = require('express');
const passport = require('passport');

const router = express.Router();

// Session login route
router.post('/login-session', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in successfully via session', user: req.user });
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Logout error' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Protected route using session
router.get('/protected', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: 'Access granted via session', user: req.user });
  } else {
    res.status(401).json({ message: 'Unauthorized (not logged in)' });
  }
});

module.exports = router;
