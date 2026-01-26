const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    registration,
    login,
    logout,
    getUserInfo
} = require('../controllers/userController');

router.post('/login', login);
router.post('/register', registration);
router.get('/info', protect, getUserInfo);
router.post('/logout', protect, logout);

module.exports = router;