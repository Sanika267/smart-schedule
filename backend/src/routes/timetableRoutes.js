const express = require('express');
const {
  generate,
  getDivisionTimetable,
  getAllTimetables,
  upsertSlot,
  clearDivisionTimetable
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// GET /api/timetable            -> all divisions, shaped like frontend DUMMY_TIMETABLE
// POST /api/timetable/generate  -> admin triggers the generator
router.get('/', getAllTimetables);
router.post('/generate', authorize('admin'), generate);
router.post('/slot', authorize('admin'), upsertSlot);

router.get('/division/:divisionId', getDivisionTimetable);
router.delete('/division/:divisionId', authorize('admin'), clearDivisionTimetable);

module.exports = router;
