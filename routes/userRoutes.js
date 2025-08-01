const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getPaginatedUsers,
  updateUser,
  deleteUser,
  getUserWithAddresses
} = require('../controllers/userController');

const {
   addAddress,
   deleteAddress
} = require('../controllers/addressController');

const authMiddleware = require('../middleware/authMiddleware');

// POST /user/register
router.post('/register', registerUser); //public route...no middleware required

// POST /user/login
router.post('/login', loginUser);  //public routes..no middleware required

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

// GET /user/:id/addresses
router.get('/:id/address', authMiddleware, getUserWithAddresses);

// DELETE /user/:id/addresses
router.delete('/address', authMiddleware, deleteAddress);


module.exports = router;

