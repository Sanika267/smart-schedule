const asyncHandler = require('express-async-handler');
const Classroom = require('../models/Classroom');

const getClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find().sort({ name: 1 });
  res.json({ success: true, count: classrooms.length, classrooms });
});

const createClassroom = asyncHandler(async (req, res) => {
  const { name, type, capacity } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Classroom name is required');
  }
  const classroom = await Classroom.create({ name, type, capacity });
  res.status(201).json({ success: true, classroom });
});

const updateClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!classroom) {
    res.status(404);
    throw new Error('Classroom not found');
  }
  res.json({ success: true, classroom });
});

const deleteClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findByIdAndDelete(req.params.id);
  if (!classroom) {
    res.status(404);
    throw new Error('Classroom not found');
  }
  res.json({ success: true, message: 'Classroom deleted' });
});

module.exports = { getClassrooms, createClassroom, updateClassroom, deleteClassroom };
