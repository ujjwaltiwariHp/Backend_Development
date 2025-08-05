const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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

// Passport Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
},async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName || '';
    const lastName = profile.name.familyName || '';
    const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
    const hashedPassword = await bcrypt.hash('password', 10); 
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0];

    if (!user) {
      const insertResult = await pool.query(
        `INSERT INTO users (email, first_name, last_name, username, password)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [email, firstName, lastName, username, hashedPassword]
      );user = insertResult.rows[0];
    }
    return done(null, user);
  } 
  catch (err) {
  return done(err);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});
