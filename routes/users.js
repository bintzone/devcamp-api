const express = require('express');
const advancedResults = require('../middleWare/advancedResault');
const { protect, authorize } = require('../middleWare/auth');
const {
  CreateUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');
const User = require('../models/User');
const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(CreateUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
