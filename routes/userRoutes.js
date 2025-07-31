const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getPaginatedUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { addAddress } = require('../controllers/addressController');

const authMiddleware = require('../middleware/authMiddleware');

// POST /user/register
router.post('/register', registerUser); //public route...no middleware needed

// POST /user/login
router.post('/login', loginUser);  //public routes..no middleware needed

// GET /user
router.get('/',authMiddleware, getAllUsers);

// GET /user/:id
router.get('/:id',authMiddleware, getUserById);

// GET /user/list(Pagination)
router.get('/list/:page', authMiddleware, getPaginatedUsers);

// PUT /user/:id
router.put('/:id',authMiddleware, updateUser);

// DELETE /user/:id
router.delete('/:id',authMiddleware, deleteUser);

// POST /user/address
router.post('/address', authMiddleware, addAddress);

module.exports = router;

