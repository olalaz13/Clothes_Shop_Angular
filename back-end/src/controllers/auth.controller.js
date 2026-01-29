const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { fullname, username, email, password, role } = req.body;

    let user = await User.findOne({ $or: [{ username }, { email }] });

    if (user && user.isVerified) {
        return next(new ErrorResponse('Username or email already exists.', 400));
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    if (user && !user.isVerified) {
        // Update existing unverified user
        user.verificationToken = verificationToken;
        user.fullname = fullname || user.fullname;
        user.password = password || user.password;
        await user.save();
    } else {
        // Create new user
        user = await User.create({
            fullname,
            username,
            email,
            password,
            role,
            verificationToken
        });
    }

    // Create verification URL
    const verificationUrl = `http://localhost:4200/verify-email?token=${verificationToken}`;
    const message = `Please verify your email by clicking the link: \n\n ${verificationUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Email Verification - ClothesShop',
            template: 'verifyEmail',
            context: {
                name: user.fullname,
                url: verificationUrl
            }
        });

        res.status(201).json({
            success: true,
            message: 'Verification email sent. Please check your inbox.'
        });
    } catch (err) {
        console.error('Registration Email Error:', err);
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse('Email could not be sent. Please check your SMTP settings.', 500));
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {

    // return next(new ErrorResponse('Máy chủ đang gặp sự cố nghiêm trọng (Lỗi 500)', 500));

    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // 2. Check for user
    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorResponse('Invalid email or password.', 401));
    }

    // 3. Check if user is verified
    if (!user.isVerified) {
        return next(new ErrorResponse('Please verify your email before logging in.', 401));
    }

    // 4. Check if password matches
    if (await user.comparePassword(password)) {
        res.json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            birthday: user.birthday,
            gender: user.gender,
            token: generateToken(user._id)
        });
    } else {
        return next(new ErrorResponse('Invalid email or password.', 401));
    }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({
        verificationToken: req.params.token
    });

    if (!user) {
        return next(new ErrorResponse('Invalid or expired token', 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Email verified successfully. You can now login.'
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.fullname = req.body.fullname || user.fullname;
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.birthday = req.body.birthday || user.birthday;
        user.gender = req.body.gender || user.gender;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            username: updatedUser.username,
            role: updatedUser.role,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            birthday: updatedUser.birthday,
            gender: updatedUser.gender,
            token: generateToken(updatedUser._id)
        });
    } else {
        return next(new ErrorResponse('User not found. Please register again.', 404));
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token - ClothesShop',
            template: 'resetPassword',
            context: {
                url: resetUrl
            }
        });

        res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset success'
    });
});
