const express = require('express');
const router = express.Router();
const { fetchFlipkartMobiles } = require('../controllers/flipkartController');
const { fetchFlipkartMobileFull } = require('../controllers/flipkartFullScraper');

router.get('/fetch/flipkart/mobile', fetchFlipkartMobiles);
router.get('/fetch/flipkart/mobile/full', fetchFlipkartMobileFull);

module.exports = router;

