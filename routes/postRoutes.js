const express = require('express');
const router = express.Router();
const { submitPost } = require('../controllers/postController'); 

router.post('/submit', submitPost);

module.exports = router;
