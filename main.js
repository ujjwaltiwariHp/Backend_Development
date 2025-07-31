const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = require('./database/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(cors());
app.use(express.json());
app.use('/user', userRoutes);
app.use('/user', authRoutes);


const startServer = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected at:', res.rows[0].now);
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(' DB connection error:', err.message);
    process.exit(1);
  }
};

startServer();
