const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');

const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

const getLoginForm = (req, res) => {
  res.render('login', {
    title: 'Log into your account',
  });
};

const getAccount = (req, res) => {
  res.render('account', {
    title: 'Your account',
  });
};

const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
};
