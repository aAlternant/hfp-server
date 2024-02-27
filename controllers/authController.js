const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const addCookieWithJWT = (res, userId) => {
  const token = signToken(userId);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: process.env.NODE_ENV === 'production',

    httpOnly: true,
  });
};

exports.signUp = catchAsync(async (req, res, _next) => {
  const { username, email, password, passwordConfirm } = req.body;

  const newUser = await UserModel.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  addCookieWithJWT(res, newUser._id);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, username } = req.body;

  if (!username || !password) {
    return next(new AppError('Please profide username and password!', 400));
  }

  const user = await UserModel.findOne({ username }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Incorect email or password', 401));
  }

  addCookieWithJWT(res, user._id);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt');
  res.status(204).json({
    message: 'success',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new AppError('Your are not logged in! Please log in to get access', 401),
    );
  }

  const userToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const tokenOwner = await UserModel.findById(userToken.id);

  if (!tokenOwner || tokenOwner.isPasswordChangedAfter(userToken.iat)) {
    return next(
      new AppError(
        "User don't exist or changed password. Please log in again",
        401,
      ),
    );
  }

  req.user = tokenOwner;

  next();
});
