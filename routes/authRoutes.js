const express = require('express');
const passport = require('passport');

const router = express.Router();

//SESSION LOCAL STRATEGY 

router.post('/login-session', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in successfully ', user: req.user });
});

router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Logout error' });
    res.json({ message: 'Logged out successfully' });
  });
});


router.get('/protected', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: 'Access granted ', user: req.user });
  } else {
    res.status(401).json({ message: 'Unauthorized (not logged in)' });
  }
});

//GOOGLE STRATEGY
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    session: true,
  }),
  (req, res) => {
    res.json({ message: 'login successful', user: req.user });
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'login failed' });
});

module.exports = router;
