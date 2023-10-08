const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title fo the review'],
    maxLength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add a text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10 '],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// prevent user for submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// sattic method get avarage rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  console.log('Calculating avg cost.....'.blue);

  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.log(error);
  }
};

// call getAvarge cost after save
ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.bootcamp);
});

// call getAvarge cost before remove
ReviewSchema.post('deleteOne', { document: true }, async function () {
  await this.constructor.getAverageRating(this.bootcamp);
});
module.exports = mongoose.model('Review', ReviewSchema);
