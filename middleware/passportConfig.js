const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
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

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
  scope: ['user:email'] 
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub profile:', profile);
    const githubUsername = profile.username;
    const githubEmail = profile.emails && profile.emails[0]?.value
      ? profile.emails[0].value
      : `${githubUsername}@github.com`; 
    const fullName = profile.displayName || 'GitHub User';
    const [first_name, last_name] = fullName.split(' ');

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [githubEmail]
    );

    if (existingUser.rows.length > 0) {
      return done(null, existingUser.rows[0]);
    }

    const newUser = await pool.query(`
      INSERT INTO users (username, email, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [
      githubUsername,
      githubEmail,
      first_name || 'GitHub',
      last_name || 'User'
    ]);

    return done(null, newUser.rows[0]);
    

  } catch (err) {
    console.error('GitHub strategy error:', err.message);
    return done(err, null);
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
