const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    wrapperRegisteration,
    wrapperLogin,
    wrapperLogout,
    wrapperGetUserInfo
} = require('../controllers/userController');

router.post('/login', wrapperLogin);
router.post('/register', wrapperRegisteration);
router.get('/info', protect, wrapperGetUserInfo);
router.post('/logout', protect, wrapperLogout);

module.exports = router;