const asyncHandler = require('express-async-handler');
const Teacher = require('../models/Teacher');
const TimetableSlot = require('../models/TimetableSlot');

// @desc    List all teachers
// @route   GET /api/teachers
// @access  Private
const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().populate('subjects', 'name code division').sort({ name: 1 });
  res.json({ success: true, count: teachers.length, teachers });
});

// @desc    Get a single teacher
// @route   GET /api/teachers/:id
// @access  Private
const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate('subjects');
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.json({ success: true, teacher });
});

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private/Admin
const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, department, maxWeeklyLoad } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Teacher name is required');
  }

  const teacher = await Teacher.create({ name, email, department, maxWeeklyLoad });
  res.status(201).json({ success: true, teacher });
});

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({ success: true, teacher });
});

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.json({ success: true, message: 'Teacher deleted' });
});

// @desc    Get the timetable for the logged-in teacher (or a specified teacher id)
// @route   GET /api/teachers/:id/timetable
// @access  Private (teacher sees own; admin can view any)
const getTeacherTimetable = asyncHandler(async (req, res) => {
  const teacherId = req.params.id;

  const slots = await TimetableSlot.find({ teacherRef: teacherId })
    .populate('division', 'code title')
    .sort({ day: 1, time: 1 });

  res.json({ success: true, count: slots.length, timetable: slots });
});

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherTimetable
};
