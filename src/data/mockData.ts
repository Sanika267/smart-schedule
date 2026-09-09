import { Division, Room, Subject, Teacher, TimeSlot } from '../types/timetable';

export const STANDARD_PERIODS: TimeSlot[] = [
  { id: 'period-0', periodIndex: 0, startTime: '09:00', endTime: '10:00', label: '09:00 - 10:00' },
  { id: 'period-1', periodIndex: 1, startTime: '10:00', endTime: '11:00', label: '10:00 - 11:00' },
  { id: 'period-2', periodIndex: 2, startTime: '11:00', endTime: '12:00', label: '11:00 - 12:00' },
  { id: 'period-3', periodIndex: 3, startTime: '12:00', endTime: '13:00', label: '12:00 - 13:00' },
  { id: 'period-4', periodIndex: 4, startTime: '13:00', endTime: '14:00', isBreak: true, label: '13:00 - 14:00 (Lunch)' },
  { id: 'period-5', periodIndex: 5, startTime: '14:00', endTime: '15:00', label: '14:00 - 15:00' },
  { id: 'period-6', periodIndex: 6, startTime: '15:00', endTime: '16:00', label: '15:00 - 16:00' },
  
];

export const LUNCH_PERIOD_INDEX = 4;

export const INITIAL_ROOMS: Room[] = [
  { id: 'room-101', name: 'Lecture Hall 101', type: 'classroom', capacity: 65, building: 'Academic Block A' },
  { id: 'room-102', name: 'Lecture Hall 102', type: 'classroom', capacity: 65, building: 'Academic Block A' },
  { id: 'room-201', name: 'Smart Classroom 201', type: 'classroom', capacity: 60, building: 'Academic Block B' },
  { id: 'room-202', name: 'Smart Classroom 202', type: 'classroom', capacity: 60, building: 'Academic Block B' },
  { id: 'lab-sys', name: 'Systems & OS Lab', type: 'lab', capacity: 40, building: 'Computing Center' },
  { id: 'lab-ai', name: 'AI & Data Science Lab', type: 'lab', capacity: 40, building: 'Computing Center' },
  { id: 'lab-net', name: 'Computer Networks Lab', type: 'lab', capacity: 40, building: 'Computing Center' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    theoryHoursPerWeek: 3,
    practicalHoursPerWeek: 2, // 1 block of 2 hours
    color: '#3B82F6', // Blue
    isLabRequired: true,
  },
  {
    id: 'sub-dbms',
    code: 'CS302',
    name: 'Database Management Systems',
    theoryHoursPerWeek: 3,
    practicalHoursPerWeek: 2,
    color: '#10B981', // Emerald
    isLabRequired: true,
  },
  {
    id: 'sub-os',
    code: 'CS303',
    name: 'Operating Systems',
    theoryHoursPerWeek: 3,
    practicalHoursPerWeek: 2,
    color: '#8B5CF6', // Purple
    isLabRequired: true,
  },
  {
    id: 'sub-cn',
    code: 'CS304',
    name: 'Computer Networks',
    theoryHoursPerWeek: 3,
    practicalHoursPerWeek: 2,
    color: '#F59E0B', // Amber
    isLabRequired: true,
  },
  {
    id: 'sub-se',
    code: 'CS305',
    name: 'Software Engineering & Agile',
    theoryHoursPerWeek: 3,
    practicalHoursPerWeek: 0,
    color: '#EC4899', // Pink
    isLabRequired: false,
  },
  {
    id: 'sub-math',
    code: 'BS301',
    name: 'Discrete Mathematics & Graph Theory',
    theoryHoursPerWeek: 4,
    practicalHoursPerWeek: 0,
    color: '#6366F1', // Indigo
    isLabRequired: false,
  },
  {
    id: 'sub-ai',
    code: 'AI301',
    name: 'Artificial Intelligence & Machine Learning',
    theoryHoursPerWeek: 3,
    practicalHoursPerWeek: 2,
    color: '#06B6D4', // Cyan
    isLabRequired: true,
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-sharma',
    name: 'Dr. Rajesh Sharma',
    email: 'r.sharma@college.edu',
    department: 'Computer Science',
    qualifiedSubjectIds: ['sub-dsa', 'sub-ai'],
    maxWeeklyHours: 18,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    isAvailable: true,
  },
  {
    id: 't-verma',
    name: 'Prof. Anita Verma',
    email: 'a.verma@college.edu',
    department: 'Computer Science',
    qualifiedSubjectIds: ['sub-dbms', 'sub-se'],
    maxWeeklyHours: 18,
    preferredDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    isAvailable: true,
  },
  {
    id: 't-kulkarni',
    name: 'Dr. Vivek Kulkarni',
    email: 'v.kulkarni@college.edu',
    department: 'Computer Science',
    qualifiedSubjectIds: ['sub-os', 'sub-cn'],
    maxWeeklyHours: 18,
    preferredDays: ['Monday', 'Wednesday', 'Friday'],
    isAvailable: true,
  },
  {
    id: 't-iyer',
    name: 'Prof. Meera Iyer',
    email: 'm.iyer@college.edu',
    department: 'Computer Science',
    qualifiedSubjectIds: ['sub-dsa', 'sub-math'],
    maxWeeklyHours: 18,
    preferredDays: ['Monday', 'Tuesday', 'Thursday'],
    isAvailable: true,
  },
  {
    id: 't-patel',
    name: 'Dr. Hiren Patel',
    email: 'h.patel@college.edu',
    department: 'Information Technology',
    qualifiedSubjectIds: ['sub-dbms', 'sub-cn', 'sub-se'],
    maxWeeklyHours: 18,
    isAvailable: true,
  },
  {
    id: 't-gupta',
    name: 'Prof. Neha Gupta',
    email: 'n.gupta@college.edu',
    department: 'Artificial Intelligence',
    qualifiedSubjectIds: ['sub-ai', 'sub-dsa'],
    maxWeeklyHours: 16,
    isAvailable: true,
  },
  {
    id: 't-das',
    name: 'Dr. Subhash Das',
    email: 's.das@college.edu',
    department: 'Basic Sciences',
    qualifiedSubjectIds: ['sub-math'],
    maxWeeklyHours: 18,
    isAvailable: true,
  },
  {
    id: 't-nair',
    name: 'Prof. Arjun Nair',
    email: 'a.nair@college.edu',
    department: 'Computer Science',
    qualifiedSubjectIds: ['sub-os', 'sub-se'],
    maxWeeklyHours: 16,
    isAvailable: true,
  },
];

export const INITIAL_DIVISIONS: Division[] = [
  {
    id: 'div-cs3a',
    name: 'CS - 3rd Year (Div A)',
    department: 'Computer Science',
    semester: 5,
    studentCount: 58,
    subjectIds: ['sub-dsa', 'sub-dbms', 'sub-os', 'sub-cn', 'sub-se', 'sub-math'],
    defaultClassroomId: 'room-101',
  },
  {
    id: 'div-cs3b',
    name: 'CS - 3rd Year (Div B)',
    department: 'Computer Science',
    semester: 5,
    studentCount: 60,
    subjectIds: ['sub-dsa', 'sub-dbms', 'sub-os', 'sub-cn', 'sub-se', 'sub-math'],
    defaultClassroomId: 'room-102',
  },
  {
    id: 'div-ai2a',
    name: 'AI & Data - 2nd Year (Div A)',
    department: 'Artificial Intelligence',
    semester: 3,
    studentCount: 55,
    subjectIds: ['sub-dsa', 'sub-ai', 'sub-math', 'sub-dbms', 'sub-se'],
    defaultClassroomId: 'room-201',
  },
  {
    id: 'div-ai2b',
    name: 'AI & Data - 2nd Year (Div B)',
    department: 'Artificial Intelligence',
    semester: 3,
    studentCount: 55,
    subjectIds: ['sub-dsa', 'sub-ai', 'sub-math', 'sub-dbms', 'sub-se'],
    defaultClassroomId: 'room-202',
  },
  {
    id: 'div-ai2c',
    name: 'AI & Data - 2nd Year (Div C)',
    department: 'Artificial Intelligence',
    semester: 3,
    studentCount: 55,
    subjectIds: ['sub-dsa', 'sub-ai', 'sub-math', 'sub-dbms', 'sub-se'],
    defaultClassroomId: 'room-101',
  },
];
