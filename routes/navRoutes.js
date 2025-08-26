const express = require('express');
const router = express.Router();
const { fetchMutualFundNAV } = require('../controllers/navController');

router.get('/fetch/nav/:scheme', fetchMutualFundNAV);

module.exports = router;
