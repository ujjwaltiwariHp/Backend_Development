const express = require('express');
const router = express.Router();
const { fetchFlipkartMobiles } = require('../controllers/flipkartController');

router.get('/fetch/flipkart/mobile', fetchFlipkartMobiles);

module.exports = router;

