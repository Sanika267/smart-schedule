const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true }, // e.g. SE1
    title: { type: String, required: true }, // e.g. "Second Year - Division 1 (SE1)"
    year: { type: String, enum: ['SE', 'TE', 'BE'], required: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null },
    studentStrength: { type: Number, default: 60 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Division', divisionSchema);
