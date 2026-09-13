export const DEPARTMENT_INFO = {
  name: "Computer Engineering",
  code: "COMP",
  divisions: ["SE1", "SE2", "SE3", "TE1", "TE2"],
  academicYear: "2025-2026",
  semester: "Even Semester"
};

export const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 01:00", // Lunch Break
  "01:00 - 02:00",
  "02:00 - 03:00",
  "03:00 - 04:00"
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DIVISIONS_INFO = {
  SE1: { title: "Second Year - Division 1 (SE1)", classTeacher: "Prof. S. R. Kulkarni", room: "CR-201" },
  SE2: { title: "Second Year - Division 2 (SE2)", classTeacher: "Prof. N. V. Patil", room: "CR-202" },
  SE3: { title: "Second Year - Division 3 (SE3)", classTeacher: "Prof. R. M. Shah", room: "CR-203" },
  TE1: { title: "Third Year - Division 1 (TE1)", classTeacher: "Dr. A. B. Joshi", room: "CR-304" },
  TE2: { title: "Third Year - Division 2 (TE2)", classTeacher: "Prof. V. D. Rao", room: "CR-305" }
};

// Dummy Timetable Data structured by Division -> Day -> TimeSlot
export const DUMMY_TIMETABLE = {
  SE1: {
    Monday: [
      { time: "09:00 - 10:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-201", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-201", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-201", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-201", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DS Lab (Batch A)", teacher: "Prof. S. R. Kulkarni", classroom: "Lab 203", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DS Lab (Batch B)", teacher: "Prof. S. R. Kulkarni", classroom: "Lab 203", type: "Lab" }
    ],
    Tuesday: [
      { time: "09:00 - 10:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-201", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-201", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-201", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "OOP Lab (Batch A)", teacher: "Prof. N. V. Patil", classroom: "Lab 205", type: "Lab" },
      { time: "02:00 - 03:00", subject: "OOP Lab (Batch B)", teacher: "Prof. N. V. Patil", classroom: "Lab 205", type: "Lab" },
      { time: "03:00 - 04:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-201", type: "Lecture" }
    ],
    Wednesday: [
      { time: "09:00 - 10:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-201", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-201", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-201", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-201", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DEL Lab (Batch A)", teacher: "Prof. P. K. Mehta", classroom: "Lab 102", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DEL Lab (Batch B)", teacher: "Prof. P. K. Mehta", classroom: "Lab 102", type: "Lab" }
    ],
    Thursday: [
      { time: "09:00 - 10:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-201", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-201", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-201", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-201", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "SE Mini Project", teacher: "Dr. K. T. Varma", classroom: "Lab 203", type: "Lab" },
      { time: "03:00 - 04:00", subject: "SE Mini Project", teacher: "Dr. K. T. Varma", classroom: "Lab 203", type: "Lab" }
    ],
    Friday: [
      { time: "09:00 - 10:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-201", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-201", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-201", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-201", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "Aptitude & Soft Skills", teacher: "Guest Speaker", classroom: "Auditorium", type: "Lecture" },
      { time: "03:00 - 04:00", subject: "Sports / Library", teacher: "Prof. S. R. Kulkarni", classroom: "Ground", type: "Activity" }
    ],
    Saturday: [
      { time: "09:00 - 10:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-201", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-201", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Remedial / Doubt Session", teacher: "Prof. S. R. Kulkarni", classroom: "CR-201", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Department Club Activity", teacher: "Prof. N. V. Patil", classroom: "Seminar Hall", type: "Activity" },
      { time: "02:00 - 03:00", subject: "Self Study", teacher: "-", classroom: "Library", type: "Activity" },
      { time: "03:00 - 04:00", subject: "Weekend Off", teacher: "-", classroom: "-", type: "Break" }
    ]
  },
  TE1: {
    Monday: [
      { time: "09:00 - 10:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-304", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-304", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-304", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-304", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "OS Lab (Batch A)", teacher: "Dr. A. B. Joshi", classroom: "Lab 301", type: "Lab" },
      { time: "03:00 - 04:00", subject: "OS Lab (Batch B)", teacher: "Dr. A. B. Joshi", classroom: "Lab 301", type: "Lab" }
    ],
    Tuesday: [
      { time: "09:00 - 10:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-304", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-304", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-304", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "CN Lab (Batch A)", teacher: "Prof. V. D. Rao", classroom: "Lab 305", type: "Lab" },
      { time: "02:00 - 03:00", subject: "CN Lab (Batch B)", teacher: "Prof. V. D. Rao", classroom: "Lab 305", type: "Lab" },
      { time: "03:00 - 04:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-304", type: "Lecture" }
    ],
    Wednesday: [
      { time: "09:00 - 10:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-304", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-304", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Web Technologies", teacher: "Prof. E. R. Thorne", classroom: "CR-304", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-304", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DBMS Lab (Batch A)", teacher: "Prof. C. H. More", classroom: "Lab 302", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DBMS Lab (Batch B)", teacher: "Prof. C. H. More", classroom: "Lab 302", type: "Lab" }
    ],
    Thursday: [
      { time: "09:00 - 10:00", subject: "Web Technologies", teacher: "Prof. E. R. Thorne", classroom: "CR-304", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-304", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-304", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Web Tech Lab (Batch A)", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" },
      { time: "02:00 - 03:00", subject: "Web Tech Lab (Batch B)", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" },
      { time: "03:00 - 04:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-304", type: "Lecture" }
    ],
    Friday: [
      { time: "09:00 - 10:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-304", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Web Technologies", teacher: "Prof. E. R. Thorne", classroom: "CR-304", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Honors/Minors Course", teacher: "Guest Faculty", classroom: "CR-304", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Seminar & Presentation", teacher: "Dr. A. B. Joshi", classroom: "CR-304", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "Industry Expert Session", teacher: "External Guest", classroom: "Auditorium", type: "Activity" },
      { time: "03:00 - 04:00", subject: "Sports / Placement Prep", teacher: "Dr. A. B. Joshi", classroom: "Seminar Hall", type: "Activity" }
    ],
    Saturday: [
      { time: "09:00 - 10:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-304", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Web Technologies", teacher: "Prof. E. R. Thorne", classroom: "CR-304", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Placement Mock Test", teacher: "Dr. A. B. Joshi", classroom: "Lab 301", type: "Lab" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Hackathon Prep / Project", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" },
      { time: "02:00 - 03:00", subject: "Hackathon Prep / Project", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" },
      { time: "03:00 - 04:00", subject: "Weekend Off", teacher: "-", classroom: "-", type: "Break" }
    ]
  },
  SE2: {
    Monday: [
      { time: "09:00 - 10:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-202", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-202", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-202", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-202", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "OOP Lab (Batch A)", teacher: "Prof. N. V. Patil", classroom: "Lab 205", type: "Lab" },
      { time: "03:00 - 04:00", subject: "OOP Lab (Batch B)", teacher: "Prof. N. V. Patil", classroom: "Lab 205", type: "Lab" }
    ],
    Tuesday: [
      { time: "09:00 - 10:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-202", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-202", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-202", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-202", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DS Lab (Batch A)", teacher: "Prof. S. R. Kulkarni", classroom: "Lab 203", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DS Lab (Batch B)", teacher: "Prof. S. R. Kulkarni", classroom: "Lab 203", type: "Lab" }
    ],
    Wednesday: [
      { time: "09:00 - 10:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-202", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-202", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-202", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-202", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DEL Lab (Batch A)", teacher: "Prof. P. K. Mehta", classroom: "Lab 102", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DEL Lab (Batch B)", teacher: "Prof. P. K. Mehta", classroom: "Lab 102", type: "Lab" }
    ],
    Thursday: [
      { time: "09:00 - 10:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-202", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-202", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-202", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-202", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "SE Mini Project", teacher: "Dr. K. T. Varma", classroom: "Lab 203", type: "Lab" },
      { time: "03:00 - 04:00", subject: "SE Mini Project", teacher: "Dr. K. T. Varma", classroom: "Lab 203", type: "Lab" }
    ],
    Friday: [
      { time: "09:00 - 10:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-202", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-202", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-202", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-202", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "Aptitude & Soft Skills", teacher: "Guest Speaker", classroom: "Auditorium", type: "Lecture" },
      { time: "03:00 - 04:00", subject: "Sports / Library", teacher: "Prof. N. V. Patil", classroom: "Ground", type: "Activity" }
    ],
    Saturday: [
      { time: "09:00 - 10:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-202", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-202", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Remedial / Doubt Session", teacher: "Prof. N. V. Patil", classroom: "CR-202", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Department Club Activity", teacher: "Prof. S. R. Kulkarni", classroom: "Seminar Hall", type: "Activity" },
      { time: "02:00 - 03:00", subject: "Self Study", teacher: "-", classroom: "Library", type: "Activity" },
      { time: "03:00 - 04:00", subject: "Weekend Off", teacher: "-", classroom: "-", type: "Break" }
    ]
  },
  SE3: {
    Monday: [
      { time: "09:00 - 10:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-203", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-203", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-203", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-203", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DEL Lab (Batch A)", teacher: "Prof. P. K. Mehta", classroom: "Lab 102", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DEL Lab (Batch B)", teacher: "Prof. P. K. Mehta", classroom: "Lab 102", type: "Lab" }
    ],
    Tuesday: [
      { time: "09:00 - 10:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-203", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-203", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-203", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-203", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "OOP Lab (Batch A)", teacher: "Prof. N. V. Patil", classroom: "Lab 205", type: "Lab" },
      { time: "03:00 - 04:00", subject: "OOP Lab (Batch B)", teacher: "Prof. N. V. Patil", classroom: "Lab 205", type: "Lab" }
    ],
    Wednesday: [
      { time: "09:00 - 10:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-203", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-203", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-203", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-203", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DS Lab (Batch A)", teacher: "Prof. S. R. Kulkarni", classroom: "Lab 203", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DS Lab (Batch B)", teacher: "Prof. S. R. Kulkarni", classroom: "Lab 203", type: "Lab" }
    ],
    Thursday: [
      { time: "09:00 - 10:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-203", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-203", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Discrete Mathematics", teacher: "Prof. R. M. Shah", classroom: "CR-203", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-203", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "SE Mini Project", teacher: "Dr. K. T. Varma", classroom: "Lab 203", type: "Lab" },
      { time: "03:00 - 04:00", subject: "SE Mini Project", teacher: "Dr. K. T. Varma", classroom: "Lab 203", type: "Lab" }
    ],
    Friday: [
      { time: "09:00 - 10:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-203", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-203", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Object Oriented Prog.", teacher: "Prof. N. V. Patil", classroom: "CR-203", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Digital Electronics", teacher: "Prof. P. K. Mehta", classroom: "CR-203", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "Aptitude & Soft Skills", teacher: "Guest Speaker", classroom: "Auditorium", type: "Lecture" },
      { time: "03:00 - 04:00", subject: "Sports / Library", teacher: "Prof. R. M. Shah", classroom: "Ground", type: "Activity" }
    ],
    Saturday: [
      { time: "09:00 - 10:00", subject: "Software Engineering", teacher: "Dr. K. T. Varma", classroom: "CR-203", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Data Structures", teacher: "Prof. S. R. Kulkarni", classroom: "CR-203", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Remedial / Doubt Session", teacher: "Prof. S. R. Kulkarni", classroom: "CR-203", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Department Club Activity", teacher: "Prof. N. V. Patil", classroom: "Seminar Hall", type: "Activity" },
      { time: "02:00 - 03:00", subject: "Self Study", teacher: "-", classroom: "Library", type: "Activity" },
      { time: "03:00 - 04:00", subject: "Weekend Off", teacher: "-", classroom: "-", type: "Break" }
    ]
  },
  TE2: {
    Monday: [
      { time: "09:00 - 10:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-305", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-305", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Web Technologies", teacher: "Prof. E. R. Thorne", classroom: "CR-305", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-305", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "CN Lab (Batch A)", teacher: "Prof. V. D. Rao", classroom: "Lab 305", type: "Lab" },
      { time: "03:00 - 04:00", subject: "CN Lab (Batch B)", teacher: "Prof. V. D. Rao", classroom: "Lab 305", type: "Lab" }
    ],
    Tuesday: [
      { time: "09:00 - 10:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-305", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-305", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-305", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-305", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "OS Lab (Batch A)", teacher: "Dr. A. B. Joshi", classroom: "Lab 301", type: "Lab" },
      { time: "03:00 - 04:00", subject: "OS Lab (Batch B)", teacher: "Dr. A. B. Joshi", classroom: "Lab 301", type: "Lab" }
    ],
    Wednesday: [
      { time: "09:00 - 10:00", subject: "Web Technologies", teacher: "Prof. E. R. Thorne", classroom: "CR-305", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-305", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-305", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-305", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "DBMS Lab (Batch A)", teacher: "Prof. C. H. More", classroom: "Lab 302", type: "Lab" },
      { time: "03:00 - 04:00", subject: "DBMS Lab (Batch B)", teacher: "Prof. C. H. More", classroom: "Lab 302", type: "Lab" }
    ],
    Thursday: [
      { time: "09:00 - 10:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-305", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-305", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Web Technologies", teacher: "Prof. E. R. Thorne", classroom: "CR-305", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-305", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "Web Tech Lab (Batch A)", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" },
      { time: "03:00 - 04:00", subject: "Web Tech Lab (Batch B)", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" }
    ],
    Friday: [
      { time: "09:00 - 10:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-305", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-305", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Computer Networks", teacher: "Prof. V. D. Rao", classroom: "CR-305", type: "Lecture" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Theory of Computation", teacher: "Dr. M. S. Gupta", classroom: "CR-305", type: "Lecture" },
      { time: "02:00 - 03:00", subject: "Seminar & Presentation", teacher: "Dr. A. B. Joshi", classroom: "CR-305", type: "Lecture" },
      { time: "03:00 - 04:00", subject: "Industry Expert Session", teacher: "External Guest", classroom: "Auditorium", type: "Activity" }
    ],
    Saturday: [
      { time: "09:00 - 10:00", subject: "Operating Systems", teacher: "Dr. A. B. Joshi", classroom: "CR-305", type: "Lecture" },
      { time: "10:00 - 11:00", subject: "Database Management Systems", teacher: "Prof. C. H. More", classroom: "CR-305", type: "Lecture" },
      { time: "11:00 - 12:00", subject: "Placement Mock Test", teacher: "Dr. A. B. Joshi", classroom: "Lab 301", type: "Lab" },
      { time: "12:00 - 01:00", subject: "Lunch Break", teacher: "-", classroom: "Cafeteria", type: "Break" },
      { time: "01:00 - 02:00", subject: "Hackathon Prep / Project", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" },
      { time: "02:00 - 03:00", subject: "Hackathon Prep / Project", teacher: "Prof. E. R. Thorne", classroom: "Lab 306", type: "Lab" },
      { time: "03:00 - 04:00", subject: "Weekend Off", teacher: "-", classroom: "-", type: "Break" }
    ]
  }
};
