const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name!'],
      unique: true,
      trim: true,
      maxLength: [40, 'A Tour must have less or  equal than 40 characters'],
      minLength: [10, 'A Tour must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: { type: Number, required: [true, 'Tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either::easy,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating Must be above 1.0'],
      max: [5, 'Rating Must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },

    price: { type: Number, required: [true, 'Tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // only work with new documents not updated
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: { type: String, required: [true, 'Tour must have a image'] },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: run before .save and .create (not in insertMany) keep it in mind
tourSchema.pre('save', function (next) {
  // console.log(this); log the current document (this refers to the current document )

  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// QUERY MIDDLEWARE

// tourSchema.pre('find', function (next) { only work when find not findById and other we solve this problem with regular expressions mean any this start with /^find/
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  // Hide secret tours if geoNear is NOT used
  if (!(this.pipeline().length > 0 && '$geoNear' in this.pipeline()[0])) {
    this.pipeline().unshift({
      $match: { secretTour: { $ne: true } },
    });
  }
  next();
});

// Models Start With Capital Letters
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
