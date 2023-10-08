const express = require('express');

const {
  getCourses,
  getCourse,
  addCourse,
  updateCoure,
  deleteCoure,
} = require('../controllers/courses');
const Course = require('../models/Course');
const router = express.Router({ mergeParams: true });
const advancedResults = require('../middleWare/advancedResault');
const { protect, authorize } = require('../middleWare/auth');

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCoure)
  .delete(protect, authorize('publisher', 'admin'), deleteCoure);
module.exports = router;
