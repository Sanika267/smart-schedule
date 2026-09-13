# Smart-Schedule

## Frontend

Smart-Schedule is an Automatic Timetable Generator for the Computer Engineering Department.

The frontend provides separate interfaces for Admin, Teacher, and Student users.

### Department

Currently, the system supports:

- Computer Engineering

### Divisions

- SE – Second Year
- TE – Third Year
- BE – Final Year

---

## Features

### Admin

Admin will have access to:

- Login
- Admin Dashboard
- Generate Timetable
- View Timetable
- Manage timetable

### Teacher

Teacher will have access to:

- Login
- Teacher Dashboard
- View timetable
- View timetable according to division

Teachers will not have access to timetable generation.

### Student

Students will have access to:

- Login
- Student Dashboard
- Select division
- View timetable

Students will not have access to timetable generation.

---

## Timetable

The timetable will contain:

- Day
- Time
- Subject
- Teacher
- Classroom
- Division

Example:

| Time | Monday | Tuesday | Wednesday | Thursday | Friday |
|------|--------|---------|-----------|----------|--------|
| 9:00 - 10:00 | DBMS | DSA | Maths | CN | AI |
| 10:00 - 11:00 | CN | AI | DSA | DBMS | Maths |

---

## Timetable Rules

The final timetable generator must prevent clashes.

### Teacher Clash

A teacher cannot teach two divisions at the same time.

Example:

```text
10:00 - 11:00

SE → Prof. A
TE → Prof. A

INVALID ❌

Setup
1. Clone the Repository
git clone <repository-url>

Move into the project:

cd smart-schedule
2. Install Dependencies

Run:

npm install
3. Start Development Server

Run:

npm run dev

The application will normally be available at:

http://localhost:5173

Open the URL in your browser.

Available Commands
Start development server
npm run dev

Build the project
npm run build

Preview production build
npm run preview

