// Kept in sync with frontend/src/data/dummyTimetable.js so the API returns
// data shaped exactly the way the existing UI expects.

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// The 4th slot (12:00 - 01:00) is always the lunch break and is never
// assigned a real subject by the generator.
const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 01:00', // Lunch Break
  '01:00 - 02:00',
  '02:00 - 03:00',
  '03:00 - 04:00'
];

const LUNCH_SLOT_INDEX = 3;

const SESSION_TYPES = ['Lecture', 'Lab', 'Activity', 'Break'];

const ROLES = ['admin', 'teacher', 'student'];

const DEPARTMENT_INFO = {
  name: 'Computer Engineering',
  code: 'COMP',
  academicYear: '2025-2026',
  semester: 'Even Semester'
};

module.exports = {
  DAYS,
  TIME_SLOTS,
  LUNCH_SLOT_INDEX,
  SESSION_TYPES,
  ROLES,
  DEPARTMENT_INFO
};
