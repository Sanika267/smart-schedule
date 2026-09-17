const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Division = require('../models/Division');
const Subject = require('../models/Subject');
const TimetableSlot = require('../models/TimetableSlot');
const { generateTimetable } = require('../utils/timetableGenerator');
const { DAYS, TIME_SLOTS } = require('../config/constants');

// @desc    Trigger automatic timetable generation for all (or selected) divisions
// @route   POST /api/timetable/generate
// @body    { divisionIds?: string[] }  -- omit to regenerate for every division
// @access  Private/Admin
const generate = asyncHandler(async (req, res) => {
  const { divisionIds } = req.body;

  const divisionFilter = divisionIds && divisionIds.length ? { _id: { $in: divisionIds } } : {};
  const divisions = await Division.find(divisionFilter);

  if (!divisions.length) {
    res.status(400);
    throw new Error('No divisions found to generate a timetable for');
  }

  const divisionsWithSubjects = [];
  for (const division of divisions) {
    const subjects = await Subject.find({ division: division._id })
      .populate('teacher', 'name')
      .populate('preferredClassroom', 'name');

    if (!subjects.length) {
      continue; // nothing to schedule for this division yet
    }
    divisionsWithSubjects.push({ division, subjects });
  }

  if (!divisionsWithSubjects.length) {
    res.status(400);
    throw new Error(
      'None of the selected divisions have subjects configured yet. Add subjects (with teachers) before generating.'
    );
  }

  const { placed, unplaced, warnings } = generateTimetable(divisionsWithSubjects);

  const generationBatch = new mongoose.Types.ObjectId().toString();
  const divisionIdsAffected = divisionsWithSubjects.map((d) => String(d.division._id));

  // Wipe any previous slots for the affected divisions, then bulk insert the new ones
  await TimetableSlot.deleteMany({ division: { $in: divisionIdsAffected } });

  const docs = placed.map((slot) => ({ ...slot, generationBatch }));
  await TimetableSlot.insertMany(docs, { ordered: false });

  res.status(201).json({
    success: true,
    message: `Timetable generated for ${divisionsWithSubjects.length} division(s) with zero teacher/classroom clashes.`,
    generationBatch,
    divisions: divisionIdsAffected,
    slotsCreated: docs.length,
    unplacedCount: unplaced.length,
    unplaced,
    warnings
  });
});

// @desc    Get the full timetable for one division, shaped like the frontend's
//          DUMMY_TIMETABLE[division] object: { Monday: [...], Tuesday: [...] }
// @route   GET /api/timetable/division/:divisionId
// @access  Private
const getDivisionTimetable = asyncHandler(async (req, res) => {
  const { divisionId } = req.params;

  const division = await Division.findById(divisionId);
  if (!division) {
    res.status(404);
    throw new Error('Division not found');
  }

  const slots = await TimetableSlot.find({ division: divisionId });

  const grouped = {};
  DAYS.forEach((day) => {
    const daySlots = slots
      .filter((s) => s.day === day)
      .sort((a, b) => TIME_SLOTS.indexOf(a.time) - TIME_SLOTS.indexOf(b.time))
      .map((s) => ({
        time: s.time,
        subject: s.subject,
        teacher: s.teacher,
        classroom: s.classroom,
        type: s.type
      }));
    grouped[day] = daySlots;
  });

  res.json({
    success: true,
    division: { id: division._id, code: division.code, title: division.title },
    timetable: grouped
  });
});

// @desc    Get timetables for every division at once, shaped like DUMMY_TIMETABLE
// @route   GET /api/timetable
// @access  Private
const getAllTimetables = asyncHandler(async (req, res) => {
  const divisions = await Division.find().sort({ year: 1, code: 1 });
  const slots = await TimetableSlot.find();

  const timetable = {};
  divisions.forEach((division) => {
    const divisionSlots = slots.filter((s) => String(s.division) === String(division._id));
    const grouped = {};
    DAYS.forEach((day) => {
      grouped[day] = divisionSlots
        .filter((s) => s.day === day)
        .sort((a, b) => TIME_SLOTS.indexOf(a.time) - TIME_SLOTS.indexOf(b.time))
        .map((s) => ({
          time: s.time,
          subject: s.subject,
          teacher: s.teacher,
          classroom: s.classroom,
          type: s.type
        }));
    });
    timetable[division.code] = grouped;
  });

  res.json({ success: true, timetable });
});

// @desc    Manually create/override a single timetable slot (e.g. fix a clash by hand)
// @route   POST /api/timetable/slot
// @access  Private/Admin
const upsertSlot = asyncHandler(async (req, res) => {
  const { division, day, time, subject, teacher, classroom, type, teacherRef, classroomRef, subjectRef } =
    req.body;

  if (!division || !day || !time || !subject) {
    res.status(400);
    throw new Error('division, day, time and subject are required');
  }

  // Enforce the same hard constraints manually: teacher/classroom cannot clash elsewhere
  if (teacherRef) {
    const clash = await TimetableSlot.findOne({
      day,
      time,
      teacherRef,
      division: { $ne: division }
    });
    if (clash) {
      res.status(409);
      throw new Error(`Teacher clash: already teaching another division at ${day} ${time}`);
    }
  }

  if (classroomRef) {
    const clash = await TimetableSlot.findOne({
      day,
      time,
      classroomRef,
      division: { $ne: division }
    });
    if (clash) {
      res.status(409);
      throw new Error(`Classroom clash: room already in use by another division at ${day} ${time}`);
    }
  }

  const slot = await TimetableSlot.findOneAndUpdate(
    { division, day, time },
    { division, day, time, subject, teacher, classroom, type, teacherRef, classroomRef, subjectRef },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, slot });
});

// @desc    Delete all generated slots for a division (reset)
// @route   DELETE /api/timetable/division/:divisionId
// @access  Private/Admin
const clearDivisionTimetable = asyncHandler(async (req, res) => {
  const result = await TimetableSlot.deleteMany({ division: req.params.divisionId });
  res.json({ success: true, deletedCount: result.deletedCount });
});

module.exports = {
  generate,
  getDivisionTimetable,
  getAllTimetables,
  upsertSlot,
  clearDivisionTimetable
};
