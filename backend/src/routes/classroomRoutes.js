const express = require('express');
const {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom
} = require('../controllers/classroomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getClassrooms).post(authorize('admin'), createClassroom);

router.route('/:id').put(authorize('admin'), updateClassroom).delete(authorize('admin'), deleteClassroom);

module.exports = router;
