const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const DEBOUNCE_TIME = 300;
const authDebounceCache = new Map();

//Token validation
const protect = async (req, res, next) => {
    try {
        const requestKey = `${req.ip}_${req.method}_${req.originalUrl}`;
        const cacheData = authDebounceCache.get(requestKey);
        
        if (cacheData && Date.now() < cacheData.expireTime) {
            req.user = cacheData.user; 
            return next();
        }

        const token = req.cookies.note_token;
        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized, please log in first.'
            });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            username: decoded.username
        };

        authDebounceCache.set(requestKey, {
            expireTime: Date.now() + DEBOUNCE_TIME,
            user: req.user 
        });
        setTimeout(() => authDebounceCache.delete(requestKey), DEBOUNCE_TIME);

        next(); 
    } catch(err) {
        console.error('Failure to verify token', err.message);
        return res.status(401).json({
            success: false,
            message: 'Your login has expired. Please log in again.'
        })
    }
};

module.exports = {protect};