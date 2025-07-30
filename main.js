const { Pool } = require('pg');
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

connectDB();
