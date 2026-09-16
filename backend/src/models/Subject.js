const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Data Structures"
    code: { type: String, trim: true, uppercase: true },
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    type: { type: String, enum: ['Lecture', 'Lab', 'Activity'], default: 'Lecture' },
    // How many slots per week this subject needs. Lab sessions are usually
    // scheduled as consecutive batch pairs (Batch A / Batch B) so labHours
    // covers both back to back slots.
    lecturesPerWeek: { type: Number, default: 3 },
    labHoursPerWeek: { type: Number, default: 0 },
    preferredClassroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
