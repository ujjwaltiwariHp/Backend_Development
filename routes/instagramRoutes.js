const express = require('express');
const router = express.Router();
const { fetchInstagramUserInfo } = require('../controllers/instagramController');

router.post('/fetch/instagram/userinfo', fetchInstagramUserInfo);

module.exports = router;
