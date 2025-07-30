const bcrypt = require('bcrypt');
const pool = require('../database/db');

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

    res.status(200).json({
      message: 'Login successful',
      access_token: user.id, // Temporary token
    });

  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { loginUser };
