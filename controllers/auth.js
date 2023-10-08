const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/erroResponse');
const asyncHandler = require('../middleWare/async');
const sendEmail = require('../utils/sendEmail');
// @desc: register new user
// @route: POST api/v1/auth/register
// @ access    public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  sendTokenCookies(user, 200, res);
});
// @desc: LOGIN new user
// @route: POST api/v1/auth/register
// @ access    public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse('please provide  email and password'), 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid Credentials'), 401);
  }
  // check if passWord MATCHES
  const isMatch = await user.matchPassowrd(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials'), 401);
  }
  sendTokenCookies(user, 200, res);
});
// @desc: logout / clear cookie
// @route: GET api/v1/auth/logout(
// @ access    private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    msg: 'logged out',
  });
});
// @desc: get me
// @route: GET api/v1/auth/register
// @ access    private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});
// @desc: update user details
// @route: PUT api/v1/auth/updatedetails
// @ access    private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc: updatePassword
// @route: GET api/v1/auth/updatepassword
// @ access    private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  // chech currentpassword
  if (!(await user.matchPassowrd(req.body.currentPassword))) {
    return next(new ErrorResponse('password incorrect'), 401);
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenCookies(user, 200, res);
});
// @desc: forgetPasowrd
// @route: post api/v1/auth/forgotpassowrd
// @ access    private

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});
// @desc: reset password
// @route: PUT api/v1/auth/resetpassword/:resettoken
// @ access    public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenCookies(user, 200, res);
});
const sendTokenCookies = (user, statusCode, res) => {
  // create token
  const token = user.getSingnedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
