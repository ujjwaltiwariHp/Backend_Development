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
  getUserWithAddresses,
  forgotPassword,
  resetPassword,
  uploadProfileImage
} = require('../controllers/userController');

const {
   addAddress,
   deleteAddress
} = require('../controllers/addressController');

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cloudinaryUploads = require('../middleware/cloudinaryUpload');
const { uploadProfileImageCloud } = require('../controllers/userController');



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
router.delete('/delete/address', authMiddleware, deleteAddress);

// POST /user/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /user/verify-reset-password
router.post('/verify-reset-password/:token',resetPassword);

// POST /user/profile-image/local
router.post('/profile-image', authMiddleware, upload.single('image'), uploadProfileImage);

//POST /user/profile-image/cloud
router.post('/profile-image/cloud', authMiddleware, cloudinaryUploads.single('profile'),uploadProfileImageCloud);


module.exports = router;

