const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Prof. S. R. Kulkarni"
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    department: { type: String, default: 'Computer Engineering' },
    // Max lectures/labs this teacher can be scheduled for per week (soft constraint used by generator)
    maxWeeklyLoad: { type: Number, default: 24 },
    // Subjects this teacher is qualified to teach
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
