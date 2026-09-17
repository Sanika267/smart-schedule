const mongoose = require('mongoose');
const { DAYS, TIME_SLOTS, SESSION_TYPES } = require('../config/constants');

const timetableSlotSchema = new mongoose.Schema(
  {
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
    day: { type: String, enum: DAYS, required: true },
    time: { type: String, enum: TIME_SLOTS, required: true },
    subject: { type: String, required: true }, // denormalized label, e.g. "Data Structures" or "Lunch Break"
    subjectRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    teacher: { type: String, default: '-' }, // denormalized teacher name for fast rendering
    teacherRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    classroom: { type: String, default: '-' }, // denormalized classroom name
    classroomRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null },
    type: { type: String, enum: SESSION_TYPES, default: 'Lecture' },
    // Tags which generation run produced this slot, so a re-generate can
    // cleanly wipe and replace prior slots for the same divisions.
    generationBatch: { type: String, index: true }
  },
  { timestamps: true }
);

// A division can only have one entry per day+time slot.
timetableSlotSchema.index({ division: 1, day: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('TimetableSlot', timetableSlotSchema);
