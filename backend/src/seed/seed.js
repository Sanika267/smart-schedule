/**
 * Seeds the database with data equivalent to frontend/src/data/dummyTimetable.js
 * so the app has something real to log into and generate timetables for.
 *
 * Usage:
 *   npm run seed            -> wipes & inserts fresh demo data
 *   npm run seed:destroy    -> wipes all data only
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Division = require('../models/Division');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Subject = require('../models/Subject');
const TimetableSlot = require('../models/TimetableSlot');

const teacherSeed = [
  { name: 'Prof. S. R. Kulkarni', email: 'kulkarni@college.edu' },
  { name: 'Prof. N. V. Patil', email: 'patil@college.edu' },
  { name: 'Prof. R. M. Shah', email: 'shah@college.edu' },
  { name: 'Prof. P. K. Mehta', email: 'mehta@college.edu' },
  { name: 'Dr. K. T. Varma', email: 'varma@college.edu' },
  { name: 'Dr. A. B. Joshi', email: 'joshi@college.edu' },
  { name: 'Prof. V. D. Rao', email: 'rao@college.edu' },
  { name: 'Dr. M. S. Gupta', email: 'gupta@college.edu' },
  { name: 'Prof. C. H. More', email: 'more@college.edu' },
  { name: 'Prof. E. R. Thorne', email: 'thorne@college.edu' }
];

const classroomSeed = [
  { name: 'CR-201', type: 'Classroom' },
  { name: 'CR-202', type: 'Classroom' },
  { name: 'CR-203', type: 'Classroom' },
  { name: 'CR-304', type: 'Classroom' },
  { name: 'CR-305', type: 'Classroom' },
  { name: 'Lab 102', type: 'Lab' },
  { name: 'Lab 203', type: 'Lab' },
  { name: 'Lab 205', type: 'Lab' },
  { name: 'Lab 301', type: 'Lab' },
  { name: 'Lab 302', type: 'Lab' },
  { name: 'Lab 305', type: 'Lab' },
  { name: 'Lab 306', type: 'Lab' },
  { name: 'Auditorium', type: 'Auditorium' },
  { name: 'Seminar Hall', type: 'Seminar Hall' }
];

const divisionSeed = [
  { code: 'SE1', title: 'Second Year - Division 1 (SE1)', year: 'SE', room: 'CR-201', classTeacher: 'Prof. S. R. Kulkarni' },
  { code: 'SE2', title: 'Second Year - Division 2 (SE2)', year: 'SE', room: 'CR-202', classTeacher: 'Prof. N. V. Patil' },
  { code: 'SE3', title: 'Second Year - Division 3 (SE3)', year: 'SE', room: 'CR-203', classTeacher: 'Prof. R. M. Shah' },
  { code: 'TE1', title: 'Third Year - Division 1 (TE1)', year: 'TE', room: 'CR-304', classTeacher: 'Dr. A. B. Joshi' },
  { code: 'TE2', title: 'Third Year - Division 2 (TE2)', year: 'TE', room: 'CR-305', classTeacher: 'Prof. V. D. Rao' }
];

// Subjects per year-group. SE divisions (SE1/SE2/SE3) all share this subject
// set (each taught by the same subject-matter teacher across divisions,
// which is exactly the scenario the generator's clash-prevention protects
// against), and TE divisions (TE1/TE2) share theirs.
const seSubjects = [
  { name: 'Data Structures', teacherEmail: 'kulkarni@college.edu', lecturesPerWeek: 4, labHoursPerWeek: 2, labRoom: 'Lab 203' },
  { name: 'Object Oriented Prog.', teacherEmail: 'patil@college.edu', lecturesPerWeek: 4, labHoursPerWeek: 2, labRoom: 'Lab 205' },
  { name: 'Discrete Mathematics', teacherEmail: 'shah@college.edu', lecturesPerWeek: 4, labHoursPerWeek: 0 },
  { name: 'Digital Electronics', teacherEmail: 'mehta@college.edu', lecturesPerWeek: 3, labHoursPerWeek: 2, labRoom: 'Lab 102' },
  { name: 'Software Engineering', teacherEmail: 'varma@college.edu', lecturesPerWeek: 3, labHoursPerWeek: 2, labRoom: 'Lab 203' }
];

const teSubjects = [
  { name: 'Operating Systems', teacherEmail: 'joshi@college.edu', lecturesPerWeek: 4, labHoursPerWeek: 2, labRoom: 'Lab 301' },
  { name: 'Computer Networks', teacherEmail: 'rao@college.edu', lecturesPerWeek: 4, labHoursPerWeek: 2, labRoom: 'Lab 305' },
  { name: 'Theory of Computation', teacherEmail: 'gupta@college.edu', lecturesPerWeek: 4, labHoursPerWeek: 0 },
  { name: 'Database Management Systems', teacherEmail: 'more@college.edu', lecturesPerWeek: 3, labHoursPerWeek: 2, labRoom: 'Lab 302' },
  { name: 'Web Technologies', teacherEmail: 'thorne@college.edu', lecturesPerWeek: 3, labHoursPerWeek: 2, labRoom: 'Lab 306' }
];

const demoUsers = [
  { name: 'Dr. Admin Officer', email: 'admin@college.edu', password: 'password123', role: 'admin' },
  { name: 'Prof. S. R. Kulkarni', email: 'teacher@college.edu', password: 'password123', role: 'teacher', teacherEmail: 'kulkarni@college.edu' },
  { name: 'Rahul Sharma', email: 'student@college.edu', password: 'password123', role: 'student', divisionCode: 'SE1' }
];

const destroyData = async () => {
  await Promise.all([
    User.deleteMany(),
    Division.deleteMany(),
    Teacher.deleteMany(),
    Classroom.deleteMany(),
    Subject.deleteMany(),
    TimetableSlot.deleteMany()
  ]);
  console.log('All collections cleared.');
};

const importData = async () => {
  await destroyData();

  const teachers = await Teacher.insertMany(teacherSeed);
  const teacherByEmail = Object.fromEntries(teachers.map((t) => [t.email, t]));

  const classrooms = await Classroom.insertMany(classroomSeed);
  const classroomByName = Object.fromEntries(classrooms.map((c) => [c.name, c]));

  const divisions = await Division.insertMany(
    divisionSeed.map((d) => ({
      code: d.code,
      title: d.title,
      year: d.year,
      room: classroomByName[d.room]?._id,
      classTeacher: teacherByEmail[teacherSeed.find((t) => t.name === d.classTeacher)?.email]?._id
    }))
  );
  const divisionByCode = Object.fromEntries(divisions.map((d) => [d.code, d]));

  const subjectDocs = [];
  divisions.forEach((division) => {
    const subjectSet = division.year === 'SE' ? seSubjects : teSubjects;
    subjectSet.forEach((s) => {
      subjectDocs.push({
        name: s.name,
        division: division._id,
        teacher: teacherByEmail[s.teacherEmail]._id,
        type: 'Lecture',
        lecturesPerWeek: s.lecturesPerWeek,
        labHoursPerWeek: s.labHoursPerWeek,
        preferredClassroom: s.labRoom ? classroomByName[s.labRoom]._id : null
      });
    });
  });
  const subjects = await Subject.insertMany(subjectDocs);

  // Sync each teacher's subjects[] array
  for (const subject of subjects) {
    await Teacher.findByIdAndUpdate(subject.teacher, { $addToSet: { subjects: subject._id } });
  }

  // Demo login accounts (admin / teacher / student), password123 for all
  for (const u of demoUsers) {
    await User.create({
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      teacher: u.teacherEmail ? teacherByEmail[u.teacherEmail]._id : null,
      division: u.divisionCode ? divisionByCode[u.divisionCode]._id : null
    });
  }

  console.log('Seed complete:');
  console.log(`  ${teachers.length} teachers`);
  console.log(`  ${classrooms.length} classrooms`);
  console.log(`  ${divisions.length} divisions (${divisions.map((d) => d.code).join(', ')})`);
  console.log(`  ${subjects.length} subjects`);
  console.log('  3 demo users: admin@college.edu / teacher@college.edu / student@college.edu (password: password123)');
  console.log('\nNext step: POST /api/timetable/generate (as admin) to build the actual schedule.');
};

const run = async () => {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await destroyData();
  } else {
    await importData();
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
