const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g. "CR-201", "Lab 203"
    type: { type: String, enum: ['Classroom', 'Lab', 'Auditorium', 'Seminar Hall', 'Ground', 'Library'], default: 'Classroom' },
    capacity: { type: Number, default: 60 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Classroom', classroomSchema);
