const User = require('../models/User');
const { JWT_EXPIRES_IN, Op } = require('../models/User');
const { createAspect } = require('../utils/aspect');

const isProd = process.env.NODE_ENV === 'production';
//registration
registration = async (req, res) => {
    const {username, password, email} = req.body || {};
    //params validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password cannot be empty.'
        });
    }
    //existaing validation
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{username: username}, {email: email}]
        }
    });
    if (existingUser) {
        console.log("existing user");
        return res.status(400).json({
            success: false,
            message: 'Username or email address has been registered.'
        });
    }
    //Create user
    const user = await User.create({
        username,
        password,
        email: email || null
    });
    //return result
    res.status(201).json({
        success: true,
        message: 'register successfully',
        data: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    }); 
}



login = async (req, res) => {
    //get params from frontend
    const {usernameOrEmail, password} = req.body || {};
    //params validation
    if (!usernameOrEmail || !password) {
        console.log("empty")
        return res.status(400).json({
            success: false,
            message: 'Username/Email and password cannot be empty.'
        });
    }
    //existing validation
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{username: usernameOrEmail}, {email: usernameOrEmail}]
        }
    });
    if (!existingUser) {
        console.log("no user");
        return res.status(401).json({
            success: false,
            message: 'Incorrect username/email or password'
        });
    }
    console.log("detected user")
    //Validate password
    const isPwdCorrect = await existingUser.comparePassword(password);
    if (!isPwdCorrect) {
        console.log("password error")
        return res.status(401).json({
            success: false,
            message: 'Incorrect username or password'
        });
    }
    const token = existingUser.generateToken();
    console.log("create token")
    res.cookie(
        'note_token',
        token,
        {
            httpOnly: true,
            maxAge: JWT_EXPIRES_IN * 1000,
            secure: isProd,
            sameSite: 'none',
            path: '/'
        }
    );
    return res.status(200).json({
        success: true,
        message: 'Login successfully',
        data: {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email || ''
        }
    })
}


getUserInfo = async (req, res) => {
    const userInfo = req.user;
    return res.status(200).json({
        success: true,
        message: 'Get user info successfully',
        data: userInfo
    });
} 

logout = async (req,res) => {
    res.clearCookie('note_token', {
        httpOnly: true,
        sameSite: 'none',
        secure: isProd,
        path: '/'
    })
     res.status(200).json({
        success: true,
        message: 'Logout successfully'
     });
} 
exports.wrapperRegisteration = createAspect(registration);
exports.wrapperLogin = createAspect(login);
exports.wrapperGetUserInfo = createAspect(getUserInfo);
exports.wrapperLogout = createAspect(logout);
