const express = require('express');
require('dotenv').config();

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express();
const port = process.env.PORT || 3000;

const pool = require('./database/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const sessionRoutse = require('./routes/sessionRoutes');

app.use(cors());
app.use(express.json());

app.use(session({
  store: new pgSession({
    pool: pool,           
    tableName: 'session'   
  }),
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));


app.use('/user', userRoutes);
app.use('/session', sessionRoutse);


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
