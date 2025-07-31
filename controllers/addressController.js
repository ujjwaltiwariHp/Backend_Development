const pool = require('../database/db');

const addAddress = async (req, res) => {
  const { address, city, state, pin_code, phone_no } = req.body;
  const user_id = req.userId; // set from authMiddleware

  if (!address || !city || !state || !pin_code || !phone_no) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO address (user_id, address, city, state, pin_code, phone_no)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, address, city, state, pin_code, phone_no]
    );

    res.status(201).json({
      message: 'Address added successfully',
      address: result.rows[0]
    });
  } catch (err) {
    console.error('Address insert error:', err.message);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

module.exports = { addAddress };
