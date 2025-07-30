const { Pool } = require('pg');
const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();

// PostgreSQL pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Async function to test DB connection
const connectDB = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(' PostgreSQL connected at:', res.rows[0].now);
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
    process.exit(1); // Exit the app if DB connection fails
  }
};


// Now connect to Db , then start the server
connectDB().then(() => {
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// Create: Registration route
app.post('/user/register', async (req, res) => {
  const { username, password, confirmPassword, email, first_name, last_name } = req.body;

  if (!username || !password || !email || !first_name || !last_name || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check if username or email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, first_name, last_name, created_at`,
      [username, email, hashedPassword, first_name, last_name]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Read: Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, first_name, last_name, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Read one: Get user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query(
      'SELECT id, username, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


app.listen(port, () => {
 console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
