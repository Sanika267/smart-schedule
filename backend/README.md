# Smart-Schedule Backend

REST API for the Smart-Schedule Automatic Timetable Generator (Dept. of Computer Engineering). Built with Express + MongoDB (Mongoose) + JWT auth.

> **Note on the current frontend:** as of this backend's writing, `frontend/src` (AuthContext, Login, Admin/Teacher/StudentDashboard) is entirely mock-driven — it reads `DUMMY_TIMETABLE` from `data/dummyTimetable.js` and stores a fake user in `localStorage`. There are no `fetch`/`axios` calls in the frontend yet. This backend is fully functional on its own (verified with `node --check` on every file and a full manual review against the frontend's expected data shapes), but the frontend needs to be updated separately to actually call these endpoints instead of using the dummy data. Ask if you'd like that wiring done too.

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local mongod or MongoDB Atlas) and a real JWT_SECRET
```

## 2. Seed demo data

```bash
npm run seed
```

This creates:
- 10 teachers, 14 classrooms, 5 divisions (SE1, SE2, SE3, TE1, TE2), ~25 subjects
- 3 demo login accounts, all with password `password123`:
  - `admin@college.edu` (role: admin)
  - `teacher@college.edu` (role: teacher)
  - `student@college.edu` (role: student)

## 3. Run

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

Server boots on `http://localhost:5000` (configurable via `PORT`).

## 4. Smoke test (curl)

```bash
# health check
curl http://localhost:5000/api/health

# login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"password123"}'
# -> copy the "token" from the response

TOKEN="paste-token-here"

# generate the timetable for every division (hard constraints enforced: no teacher/classroom clash)
curl -X POST http://localhost:5000/api/timetable/generate \
  -H "Authorization: Bearer $TOKEN"

# fetch it back, shaped exactly like frontend's DUMMY_TIMETABLE
curl http://localhost:5000/api/timetable -H "Authorization: Bearer $TOKEN"

# fetch a single division (what Timetable.jsx actually needs)
curl http://localhost:5000/api/timetable/division/<divisionId> -H "Authorization: Bearer $TOKEN"
```

If `npm run seed` printed division IDs isn't handy, `GET /api/divisions` (with the token) lists them.

## 5. API reference

All routes except `/api/health`, `/api/auth/register`, `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a user |
| POST | `/api/auth/login` | Public | Get a JWT |
| GET | `/api/auth/me` | Any | Current user |
| GET | `/api/divisions` | Any | List divisions |
| POST/PUT/DELETE | `/api/divisions[/:id]` | Admin | Manage divisions |
| GET | `/api/teachers` | Any | List teachers |
| GET | `/api/teachers/:id/timetable` | Any | A single teacher's own class slots |
| POST/PUT/DELETE | `/api/teachers[/:id]` | Admin | Manage teachers |
| GET | `/api/classrooms` | Any | List classrooms |
| POST/PUT/DELETE | `/api/classrooms[/:id]` | Admin | Manage classrooms |
| GET | `/api/subjects?division=<id>` | Any | List subjects |
| POST/PUT/DELETE | `/api/subjects[/:id]` | Admin | Manage subjects (assign teacher + weekly load) |
| GET | `/api/timetable` | Any | Every division's timetable, shaped like `DUMMY_TIMETABLE` |
| GET | `/api/timetable/division/:id` | Any | One division's timetable |
| POST | `/api/timetable/generate` | Admin | Run the generator (body: `{ divisionIds?: [] }`, omit for all) |
| POST | `/api/timetable/slot` | Admin | Manually create/override one slot (clash-checked) |
| DELETE | `/api/timetable/division/:id` | Admin | Wipe a division's generated slots |

## 6. How the generator prevents clashes

`src/utils/timetableGenerator.js` runs a randomized greedy placement with backtracking:

- **Hard constraints (never violated):** a teacher can't be double-booked across divisions at the same day+time; a classroom can't be double-booked; a division gets exactly one session per slot; the lunch slot (`12:00 - 01:00`) is never assigned a class.
- **Soft goals (best-effort):** spreads a subject's lectures across different days; places labs as two consecutive slots (Batch A / Batch B).
- If a session genuinely can't be placed without breaking a hard constraint (e.g. too many subjects for too few slots), it's left as `"Free / Self Study"` and reported back in the response's `unplaced` / `warnings` fields rather than silently creating a clash.

## 7. Known limitations / honest caveats

- This was verified with `node --check` on every file and a manual cross-check of response field names (`time`, `subject`, `teacher`, `classroom`, `type`) against `frontend/src/components/Timetable.jsx`, `pages/AdminDashboard.jsx`, `TeacherDashboard.jsx`, and `StudentDashboard.jsx` — they match.
- It has **not** been run against a live MongoDB instance in the environment this was written in (no network/DB access there). Run the smoke test in section 4 yourself before relying on it in production.
- `GET /api/teachers/:id/timetable` returns only that teacher's own class slots — useful, but note the current frontend's Teacher/Student dashboards actually render the *full division* timetable regardless of role (via `DUMMY_TIMETABLE[selectedDivision]`), so this endpoint isn't wired to anything in the UI yet.
