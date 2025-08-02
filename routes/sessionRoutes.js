// GET /user/dashboard
const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/sessionController');
const sessionAuth = require('../middleware/sessionAuth');

router.get('/dashboard', sessionAuth, getDashboard);


module.exports = router;