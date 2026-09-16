const asyncHandler = require('express-async-handler');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');

// @desc    List subjects (optionally filter by ?division=<id>)
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.division) filter.division = req.query.division;

  const subjects = await Subject.find(filter)
    .populate('teacher', 'name email')
    .populate('division', 'code title')
    .populate('preferredClassroom', 'name type')
    .sort({ name: 1 });

  res.json({ success: true, count: subjects.length, subjects });
});

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    division,
    teacher,
    type,
    lecturesPerWeek,
    labHoursPerWeek,
    preferredClassroom
  } = req.body;

  if (!name || !division || !teacher) {
    res.status(400);
    throw new Error('name, division and teacher are required');
  }

  const subject = await Subject.create({
    name,
    code,
    division,
    teacher,
    type,
    lecturesPerWeek,
    labHoursPerWeek,
    preferredClassroom
  });

  // Keep the teacher's subject list in sync so the generator can look it up quickly
  await Teacher.findByIdAndUpdate(teacher, { $addToSet: { subjects: subject._id } });

  res.status(201).json({ success: true, subject });
});

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  res.json({ success: true, subject });
});

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  await Teacher.findByIdAndUpdate(subject.teacher, { $pull: { subjects: subject._id } });

  res.json({ success: true, message: 'Subject deleted' });
});

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
