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


const deleteAddress = async (req, res) => {
  const userId = req.userId;
  let { addressIds } = req.body; 

  if (!Array.isArray(addressIds) || addressIds.length === 0) {
    return res.status(400).json({ error: 'Provide an array of address IDs to delete' });
  }

  // Ensure all IDs are integers
  addressIds = addressIds.map(id => parseInt(id)).filter(id => !isNaN(id));

  if (addressIds.length === 0) {
    return res.status(400).json({ error: 'No valid address IDs provided' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM address
       WHERE user_id = $1 AND id = ANY($2::int[])
       RETURNING *`,
      [userId, addressIds]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No matching addresses found for deletion' });
    }

    res.status(200).json({
      message: 'Address(es) deleted successfully',
      deleted: result.rows,
    });
} catch (err) {
  console.error('Delete address error:', err); 
  res.status(500).json({ error: 'Failed to delete address(es)', details: err.message });
}

};


module.exports = {
   addAddress,
   deleteAddress
   };
