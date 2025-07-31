const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/db');

// CREATE - Register a new user
const registerUser = async (req, res) => {
  const { username, email, password, confirmPassword, first_name, last_name } = req.body;

  // Check for required fields
  if (!username || !email || !password || !confirmPassword || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check for existing user
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
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

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login Controller
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
        const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      access_token: token, 
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// READ - Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query('SELECT id, username, email, first_name, last_name, created_at FROM users');
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// READ - Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query('SELECT id, username, email, first_name, last_name FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// READ - Get Paginated list of users
const getPaginatedUsers = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, created_at
       FROM users
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      page,
      users: result.rows,
    });
  } catch (err) {
    console.error('Pagination error:', err.message);
    res.status(500).json({ error: 'Failed to fetch paginated users' });
  }
};

// UPDATE - Update user by ID
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING id, username, email, first_name, last_name',
      [first_name, last_name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE - Delete user by ID
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getPaginatedUsers,
  updateUser,
  deleteUser,
};
