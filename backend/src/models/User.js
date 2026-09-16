const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, required: true, default: 'student' },
    department: { type: String, default: 'Computer Engineering' },

    // Only relevant when role === 'teacher'
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },

    // Only relevant when role === 'student'
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', default: null },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    teacher: this.teacher,
    division: this.division
  };
};

module.exports = mongoose.model('User', userSchema);
