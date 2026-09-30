const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload');

router.patch('/me', protect, upload.single('avatar'), userController.updateMyProfile);

// Admin-only user management
router.get('/', protect, roleGuard('admin'), userController.listUsers);
router.patch('/:id/status', protect, roleGuard('admin'), userController.setUserStatus);
router.delete('/:id', protect, roleGuard('admin'), userController.deleteUser);

module.exports = router;
