const express = require('express');
const router = express.Router();
const {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// POST /user/register
router.post('/register', registerUser);

// GET /user
router.get('/', getAllUsers);

// GET /user/:id
router.get('/:id', getUserById);

// PUT /user/:id
router.put('/:id', updateUser);

// DELETE /user/:id
router.delete('/:id', deleteUser);

module.exports = router;

