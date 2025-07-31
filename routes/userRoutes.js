const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// POST /user/register
router.post('/register', registerUser); //public route...no middleware needed

// POST /user/login
router.post('/login', loginUser);  //public routes..no middleware needed

// GET /user
router.get('/',authMiddleware, getAllUsers);

// GET /user/:id
router.get('/:id',authMiddleware, getUserById);

// PUT /user/:id
router.put('/:id',authMiddleware, updateUser);

// DELETE /user/:id
router.delete('/:id',authMiddleware, deleteUser);

module.exports = router;

