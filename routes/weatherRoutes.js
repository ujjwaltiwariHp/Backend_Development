const express = require('express');
const router = express.Router();
const { getWeatherByCity } = require('../controllers/weatherController');

router.get('/weather/:city', getWeatherByCity);

module.exports = router;
