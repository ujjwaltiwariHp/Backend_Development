const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../database/db');

// Passport Local strategy
passport.use(new LocalStrategy({
  usernameField: 'email', // 
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return done(null, false, { message: 'Incorrect email.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: 'Incorrect password.' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (get full user from DB using ID from session)
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});
