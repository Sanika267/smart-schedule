const express = require('express');
const {
  getDivisions,
  getDivision,
  createDivision,
  updateDivision,
  deleteDivision
} = require('../controllers/divisionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getDivisions).post(authorize('admin'), createDivision);

router
  .route('/:id')
  .get(getDivision)
  .put(authorize('admin'), updateDivision)
  .delete(authorize('admin'), deleteDivision);

module.exports = router;
