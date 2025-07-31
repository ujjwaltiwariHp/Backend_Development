const jwt = require('jsonwebtoken');
const pool = require('../database/db');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is in DB and not expired
    const result = await pool.query(
      `SELECT * FROM access_tokens WHERE token = $1 AND expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Token expired or invalid' });
    }

    req.user = decoded; // now you can use req.user in protected routes
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
