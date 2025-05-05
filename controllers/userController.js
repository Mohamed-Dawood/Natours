const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const factory = require('../controllers/handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not and image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// const upload = multer({
//   dest: 'public/img/users',
// });

// upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create Error if user POSTs password data
  console.log('req.file', req.file);
  console.log('req.body', req.body);

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to update

  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3)Update user document

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // 4) send Response

  res.status(200).json({
    status: 'success',
    data: { user: updateUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead.',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// not need case we create user when signup exports.createNewUser = factory.createOne(User);

// Don't Update Password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
