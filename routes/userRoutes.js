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

router.post('/register', registerUser); 
router.post('/login', loginUser);  
router.get('/',authMiddleware, getAllUsers);
router.get('/:id',authMiddleware, getUserById);
router.get('/list/:page', authMiddleware, getPaginatedUsers);
router.put('/:id',authMiddleware, updateUser);
router.delete('/:id',authMiddleware, deleteUser);
router.post('/address', authMiddleware, addAddress);
router.get('/:id/address', authMiddleware, getUserWithAddresses);
router.delete('/delete/address', authMiddleware, deleteAddress);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-password/:token',resetPassword);
router.post('/profile-image', authMiddleware, upload.single('image'), uploadProfileImage);
router.post('/profile-image/cloud', authMiddleware, cloudinaryUploads.single('profile'),uploadProfileImageCloud);


module.exports = router;

