const express = require('express');
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getSubjects).post(authorize('admin'), createSubject);

router.route('/:id').put(authorize('admin'), updateSubject).delete(authorize('admin'), deleteSubject);

module.exports = router;
