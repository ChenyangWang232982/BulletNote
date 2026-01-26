const User = require('../models/User');
const { JWT_EXPIRES_IN, Op } = require('../models/User');

//registration
exports.registration = async (req, res) => {
    try {
        //get params from frontend
        console.log('start to register')
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
                [Op.or]: [{username}, {email}]
            }
        });
        if (existingUser) {
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
    } catch (err) {
        console.error('Failure to register', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

exports.login = async (req, res) => {
    try {
        console.log("logging");
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
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            }
        );
        console.log("put in cookie")

        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            data: {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email || ''
            }
        })
    } catch (err) {
        console.error('User login failed:', err);
        res.status(500).json({
            success: false,
            message: 'Server error, login failed'
        });
    }
}

exports.getUserInfo = async (req, res) => {
    try {
        console.log("trying to get info")
        const userInfo = req.user;

        return res.status(200).json({
            success: true,
            message: 'Get user info successfully',
            data: userInfo
        });
    } catch (err) {
        console.error('Get user info failed:', err);
        res.status(500).json({
            success: false,
            message: 'Server error, failed to get user info'
        });
    }
}

exports.logout = async (req,res) => {
    try {
        console.log('starting to logout');
        res.clearCookie('note_token', {
            httpOnly: true,
            sameSite: 'strict',
            path: '/'
        })

         res.status(200).json({
            success: true,
            message: 'Logout successfully'
         });

    } catch (err) {
        console.error('User logout failed:', err);
        res.status(500).json({
            success: false,
            message: 'Server error, exit failed'
    });
}
}