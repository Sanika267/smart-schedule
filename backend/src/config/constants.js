// Kept in sync with frontend/src/data/dummyTimetable.js so the API returns
// data shaped exactly the way the existing UI expects.

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// College schedule time slots
// Each slot has: time (display string), schedulable (boolean), type (optional label)
const TIME_SLOTS = [
  { time: '09:00 - 09:15', label: 'Yoga & Meditation', schedulable: false, type: 'Fixed' },
  { time: '09:15 - 10:15', label: 'Period 1', schedulable: true, type: 'Lecture' },
  { time: '10:15 - 11:15', label: 'Period 2', schedulable: true, type: 'Lecture' },
  { time: '11:15 - 11:30', label: 'Short Break', schedulable: false, type: 'Fixed' },
  { time: '11:30 - 12:30', label: 'Period 3', schedulable: true, type: 'Lecture/Lab' },
  { time: '12:30 - 13:30', label: 'Period 4', schedulable: true, type: 'Lecture/Lab' },
  { time: '13:30 - 14:15', label: 'Lunch Break', schedulable: false, type: 'Fixed' },
  { time: '14:15 - 15:15', label: 'Period 5', schedulable: true, type: 'Lecture/Seminar/Elective' },
  { time: '15:15 - 16:15', label: 'Period 6', schedulable: true, type: 'Lecture/Lab' },
  { time: '16:15 - 16:30', label: 'Life Skill Practices', schedulable: false, type: 'Fixed' }
];

// Indices of non-schedulable (fixed) slots
const FIXED_SLOT_INDICES = [0, 3, 6, 9];

// For backward compatibility - array of time strings
const TIME_SLOT_STRINGS = TIME_SLOTS.map(s => s.time);

// Legacy constant - lunch is now at index 6
const LUNCH_SLOT_INDEX = 6;

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
  TIME_SLOT_STRINGS,
  FIXED_SLOT_INDICES,
  LUNCH_SLOT_INDEX,
  SESSION_TYPES,
  ROLES,
  DEPARTMENT_INFO
};