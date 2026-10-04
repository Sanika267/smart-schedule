const mongoose = require('mongoose');
const { DAYS, TIME_SLOTS, TIME_SLOT_STRINGS, SESSION_TYPES } = require('../config/constants');

const timetableSlotSchema = new mongoose.Schema(
  {
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
    day: { type: String, enum: DAYS, required: true },
    time: { type: String, enum: TIME_SLOT_STRINGS, required: true },
    subject: { type: String, required: true },
    subjectRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    teacher: { type: String, default: '-' },
    teacherRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    classroom: { type: String, default: '-' },
    classroomRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null },
    type: { type: String, enum: SESSION_TYPES, default: 'Lecture' },
    generationBatch: { type: String, index: true }
  },
  { timestamps: true }
);

timetableSlotSchema.index({ division: 1, day: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('TimetableSlot', timetableSlotSchema);