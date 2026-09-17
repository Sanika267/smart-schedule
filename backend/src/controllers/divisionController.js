const asyncHandler = require('express-async-handler');
const Division = require('../models/Division');

// @desc    List all divisions
// @route   GET /api/divisions
// @access  Private (any authenticated role)
const getDivisions = asyncHandler(async (req, res) => {
  const divisions = await Division.find()
    .populate('classTeacher', 'name email')
    .populate('room', 'name type')
    .sort({ year: 1, code: 1 });

  res.json({ success: true, count: divisions.length, divisions });
});

// @desc    Get a single division
// @route   GET /api/divisions/:id
// @access  Private
const getDivision = asyncHandler(async (req, res) => {
  const division = await Division.findById(req.params.id)
    .populate('classTeacher', 'name email')
    .populate('room', 'name type');

  if (!division) {
    res.status(404);
    throw new Error('Division not found');
  }

  res.json({ success: true, division });
});

// @desc    Create a division
// @route   POST /api/divisions
// @access  Private/Admin
const createDivision = asyncHandler(async (req, res) => {
  const { code, title, year, classTeacher, room, studentStrength } = req.body;

  if (!code || !title || !year) {
    res.status(400);
    throw new Error('code, title and year are required');
  }

  const division = await Division.create({ code, title, year, classTeacher, room, studentStrength });
  res.status(201).json({ success: true, division });
});

// @desc    Update a division
// @route   PUT /api/divisions/:id
// @access  Private/Admin
const updateDivision = asyncHandler(async (req, res) => {
  const division = await Division.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!division) {
    res.status(404);
    throw new Error('Division not found');
  }

  res.json({ success: true, division });
});

// @desc    Delete a division
// @route   DELETE /api/divisions/:id
// @access  Private/Admin
const deleteDivision = asyncHandler(async (req, res) => {
  const division = await Division.findByIdAndDelete(req.params.id);

  if (!division) {
    res.status(404);
    throw new Error('Division not found');
  }

  res.json({ success: true, message: 'Division deleted' });
});

module.exports = { getDivisions, getDivision, createDivision, updateDivision, deleteDivision };
