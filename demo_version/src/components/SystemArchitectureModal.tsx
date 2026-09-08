import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  Cpu,
  Database,
  Layers,
  Network,
  ShieldCheck,
  UserCheck,
  X,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'schema' | 'stack' | 'algorithm' | 'clash_sub' | 'api' | 'uiux'
  >('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlSchema = `-- ==========================================================
-- COLLEGE TIMETABLE MANAGEMENT SYSTEM - RELATIONAL SCHEMA (PostgreSQL)
-- ==========================================================

-- 1. Departments
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teachers / Faculty
CREATE TABLE teachers (
    id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    max_weekly_hours INT NOT NULL DEFAULT 16 CHECK (max_weekly_hours > 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_days TEXT[], -- e.g. ARRAY['Monday', 'Wednesday', 'Friday']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects (Theory + Practical)
CREATE TABLE subjects (
    id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    theory_hours_per_week INT NOT NULL DEFAULT 3,
    practical_hours_per_week INT NOT NULL DEFAULT 0,
    is_lab_required BOOLEAN NOT NULL DEFAULT FALSE,
    color_hex VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Teacher-Subject Qualification Mapping (Many-to-Many)
CREATE TABLE teacher_subject_mapping (
    teacher_id VARCHAR(36) REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE CASCADE,
    is_primary_faculty BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (teacher_id, subject_id)
);

-- 5. Classrooms & Specialized Labs
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('classroom', 'lab')),
    capacity INT NOT NULL CHECK (capacity > 0),
    building VARCHAR(100) NOT NULL,
    equipment_tags TEXT[] -- e.g. ARRAY['gpu_workstations', 'projector', 'oscilloscopes']
);

-- 6. Student Divisions / Batches
CREATE TABLE divisions (
    id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) REFERENCES departments(id),
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g. "CS-3A"
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    student_count INT NOT NULL CHECK (student_count > 0),
    default_classroom_id VARCHAR(36) REFERENCES rooms(id)
);

-- 7. Division Curriculum (Subjects assigned to a division for the semester)
CREATE TABLE division_subjects (
    division_id VARCHAR(36) REFERENCES divisions(id) ON DELETE CASCADE,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (division_id, subject_id)
);

-- 8. Master Timetable Entries (Generated or Manually Edited)
CREATE TABLE timetable_entries (
    id VARCHAR(36) PRIMARY KEY,
    division_id VARCHAR(36) NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    subject_id VARCHAR(36) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id VARCHAR(36) NOT NULL REFERENCES teachers(id),
    room_id VARCHAR(36) NOT NULL REFERENCES rooms(id),
    day_of_week VARCHAR(15) NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
    slot_index INT NOT NULL CHECK (slot_index BETWEEN 0 AND 7),
    duration_slots INT NOT NULL DEFAULT 1 CHECK (duration_slots IN (1, 2)),
    is_practical BOOLEAN NOT NULL DEFAULT FALSE,
    batch VARCHAR(20) DEFAULT 'ALL',
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Unique Composite Indexes to enforce Hard Constraints at DB Level:
-- Hard Constraint 1: No teacher booked twice in overlapping slot
CREATE UNIQUE INDEX idx_unique_teacher_slot 
ON timetable_entries(teacher_id, day_of_week, slot_index);

-- Hard Constraint 2: No room booked twice in overlapping slot
CREATE UNIQUE INDEX idx_unique_room_slot 
ON timetable_entries(room_id, day_of_week, slot_index);

-- Hard Constraint 3: No division has overlapping sessions
CREATE UNIQUE INDEX idx_unique_division_slot 
ON timetable_entries(division_id, day_of_week, slot_index);

-- 9. Substitutions
CREATE TABLE substitutions (
    id VARCHAR(36) PRIMARY KEY,
    timetable_entry_id VARCHAR(36) NOT NULL REFERENCES timetable_entries(id) ON DELETE CASCADE,
    original_teacher_id VARCHAR(36) NOT NULL REFERENCES teachers(id),
    substitute_teacher_id VARCHAR(36) NOT NULL REFERENCES teachers(id),
    date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('requested', 'confirmed', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit & Notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(20) NOT NULL CHECK (target_role IN ('all', 'faculty', 'student')),
    affected_division_id VARCHAR(36) REFERENCES divisions(id),
    affected_teacher_id VARCHAR(36) REFERENCES teachers(id),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  return (
    <div
      id="system-architecture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                System Design & Algorithm Specifications
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Academic Project Architectural Blueprint & Mathematical Formulations (Tasks 1 - 7)
              </p>
            </div>
          </div>
          <button
            id="close-architecture-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto gap-1">
          {[
            { id: 'schema', label: '1. Database Schema', icon: Database },
            { id: 'stack', label: '2. Tech Stack & Roadmap', icon: Layers },
            { id: 'algorithm', label: '3. CSP Algorithm & Pseudocode', icon: Code },
            { id: 'clash_sub', label: '4 & 5. Clash & Substitute Logic', icon: ShieldCheck },
            { id: 'api', label: '6. REST API Endpoints', icon: Network },
            { id: 'uiux', label: '7. UI/UX Workflows', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm leading-relaxed space-y-6">
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Task 1: Normalized Database Schema (PostgreSQL)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fully normalized (3NF) relational tables with foreign keys, check constraints, and unique composite indexes to prevent clashes at storage level.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(sqlSchema)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied SQL' : 'Copy DDL'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-xs text-blue-700 uppercase tracking-wide">Core Entities</span>
                  <p className="text-xs text-slate-600 mt-1">
                    Teachers, Subjects, Divisions, Rooms (Classroom/Lab), TimeSlots
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-xs text-purple-700 uppercase tracking-wide">Mappings</span>
                  <p className="text-xs text-slate-600 mt-1">
                    TeacherSubjectMapping (qualifications), DivisionSubjects (curriculum)
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-xs text-emerald-700 uppercase tracking-wide">Operational</span>
                  <p className="text-xs text-slate-600 mt-1">
                    TimetableEntries (with slot index & practical flags), Substitutions, Notifications
                  </p>
                </div>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-snug border border-slate-800">
                {sqlSchema}
              </pre>
            </div>
          )}

          {activeTab === 'stack' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Task 2: Recommended College Tech Stack & 6-Week Delivery Roadmap
                </h3>
                <p className="text-xs text-slate-500">
                  Designed for high demo impact, rapid iteration, and reliable constraint execution within an academic capstone timeline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-3">
                  <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Frontend Stack
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li><strong>Framework:</strong> React (TypeScript) + Vite — instant HMR and type safety</li>
                    <li><strong>Styling:</strong> Tailwind CSS — responsive grid layout, color-coded subjects</li>
                    <li><strong>Icons & Animations:</strong> Lucide Icons + Motion — smooth drag-drop & transitions</li>
                    <li><strong>Print / Export:</strong> HTML5 Canvas / jsPDF for 1-click printable timetable PDF generation</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-3">
                  <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Backend & Solver Engine
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li><strong>Backend Options:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li><strong>Option A (Full-Stack TypeScript):</strong> Node.js + Express / Fastify (seamless shared type models between solver & UI).</li>
                        <li><strong>Option B (Python Microservice):</strong> FastAPI + <code>python-constraint</code> or Google OR-Tools (for industrial scale CSP).</li>
                      </ul>
                    </li>
                    <li><strong>Database:</strong> PostgreSQL (ACID compliance + composite unique indexes for hard constraints) with Prisma or Drizzle ORM.</li>
                  </ul>
                </div>
              </div>

              {/* 6-Week Roadmap */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Academic Project Implementation Schedule (6 Weeks)</h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden text-xs">
                  {[
                    { week: 'Week 1', title: 'Requirements & Schema Design', desc: 'Define entities, relational schema, seed test departments, teachers, rooms, and subject curricula.' },
                    { week: 'Week 2', title: 'CSP Solver Prototyping', desc: 'Implement Backtracking solver with MRV heuristic, hard constraint validators (teacher, room, division, practicals).' },
                    { week: 'Week 3', title: 'Clash Engine & Soft Optimization', desc: 'Integrate soft-constraint scoring (gap reduction, day spreading, workload balance) and benchmark solver times.' },
                    { week: 'Week 4', title: 'REST API & CRUD Services', desc: 'Build endpoints for generation, manual drag-drop updates with real-time clash rejection, and substitute suggestion.' },
                    { week: 'Week 5', title: 'Frontend Timetable Grid & UX', desc: 'Multi-view interactive timetable (Division, Faculty, Room), instant clash visualizer, substitute modal.' },
                    { week: 'Week 6', title: 'Testing, Notification System & Demo Prep', desc: 'Simulate faculty leave scenarios, in-app notification pipeline, PDF export, final project documentation.' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 flex items-start gap-4 hover:bg-slate-50">
                      <span className="px-2.5 py-1 font-bold text-blue-700 bg-blue-100 rounded-md shrink-0">
                        {item.week}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-slate-600 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Task 3: Core Timetable Generation Algorithm (Constraint Satisfaction Problem)
                </h3>
                <p className="text-xs text-slate-500">
                  Backtracking CSP with Forward Checking, Most Constrained Variable (MRV), and Least Constraining Value (LCV) heuristics.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <p><strong>CSP Formulation:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Variables (V):</strong> Unscheduled lecture units. Each theory subject required creates <code>T</code> variables (duration = 1 hr). Each practical subject creates <code>P/2</code> variables (continuous block of duration = 2 hrs).</li>
                  <li><strong>Domains (D):</strong> Tuples of <code>(Day, SlotIndex, Teacher, Room)</code>. For 5 days × 7 available slots (excluding lunch) × Available Rooms × Qualified Teachers.</li>
                  <li><strong>Variable Ordering (MRV):</strong> 2-hour practical lab blocks are sorted first, followed by subjects with the fewest qualified teachers (tightest domains fail fastest).</li>
                  <li><strong>Value Ordering (LCV):</strong> Slots that minimize idle gaps, balance teacher workload across days, and spread theory subjects evenly across the week are evaluated first.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-xs text-slate-900">Algorithm Pseudocode:</span>
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-snug">
{`function GENERATE_TIMETABLE(Divisions, Subjects, Teachers, Rooms, Config):
    // 1. Instantiate Variables
    Variables = []
    FOR each div in Divisions:
        FOR each sub in div.subjects:
            FOR block = 1 to sub.practicals / 2:
                Variables.append(Variable(div, sub, isPractical=True, duration=2))
            FOR lecture = 1 to sub.theoryHours:
                Variables.append(Variable(div, sub, isPractical=False, duration=1))

    // 2. MRV Heuristic: Order practicals and rare-teacher subjects first
    SORT Variables BY (isPractical DESC, len(sub.qualifiedTeachers) ASC)

    // 3. Initialize Fast Lookups (O(1) sets)
    TeacherSchedule = Map<TeacherId, Set<Day_Slot>>()
    RoomSchedule = Map<RoomId, Set<Day_Slot>>()
    DivisionSchedule = Map<DivId, Set<Day_Slot>>()
    TeacherHours = Map<TeacherId, Int>()

    // 4. Backtracking Solver with Forward Checking
    FUNCTION Solve(varIndex):
        IF varIndex >= len(Variables):
            RETURN True // Solution Found!

        currentVar = Variables[varIndex]
        candidateValues = []

        FOR each teacher IN currentVar.qualifiedTeachers:
            IF TeacherHours[teacher] + currentVar.duration > teacher.maxWeeklyHours:
                CONTINUE

            FOR each day IN DaysOfWeek:
                FOR each slot IN ValidStartSlots(currentVar.duration):
                    // Avoid Lunch period
                    IF OverlapsLunch(slot, currentVar.duration): CONTINUE

                    FOR each room IN FilterRooms(currentVar.isPractical):
                        IF NOT IS_CLASH(currentVar, teacher, room, day, slot):
                            score = CALCULATE_SOFT_SCORE(teacher, room, day, slot, Config)
                            candidateValues.append((teacher, room, day, slot, score))

        // LCV: Try values that satisfy soft constraints first
        SORT candidateValues BY score DESC

        FOR (teacher, room, day, slot) IN candidateValues:
            // Forward Check: commit assignment
            ASSIGN(currentVar, teacher, room, day, slot)

            IF Solve(varIndex + 1):
                RETURN True

            // Backtrack
            UNASSIGN(currentVar, teacher, room, day, slot)

        RETURN False // Exhausted domain for currentVar

    success = Solve(0)
    RETURN (success, TimetableEntries, GenerationStats)`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'clash_sub' && (
            <div className="space-y-6">
              {/* Clash Logic */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Task 4: Clash-Detection Logic (Generation & Manual Edit)
                </h3>
                <p className="text-xs text-slate-500">
                  Mathematical condition checking run dynamically during automated generation and on manual drag-and-drop or slot modifications.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <p className="font-semibold text-slate-900">Mathematical Overlap Definition:</p>
                  <p>
                    Two sessions \(A\) and \(B\) overlap if and only if they are on the same day and:
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-300 font-mono text-xs">
                    <code>(A.day == B.day) AND max(A.start, B.start) &lt; min(A.start + A.duration, B.start + B.duration)</code>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">Six Hard Conflict Rules Enforced:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li><strong>Teacher Clash:</strong> \(A.teacherId == B.teacherId\) with temporal overlap (Faculty cannot teach two classes simultaneously).</li>
                    <li><strong>Room Clash:</strong> \(A.roomId == B.roomId\) with temporal overlap (A hall/lab cannot hold two concurrent sessions).</li>
                    <li><strong>Division Clash:</strong> \(A.divId == B.divId\) with temporal overlap (Students cannot attend two lectures at once).</li>
                    <li><strong>Lunch Break Constraint:</strong> Any session overlapping slot index 4 (13:00–14:00) is invalid.</li>
                    <li><strong>Lab Integrity Constraint:</strong> If \(A.isPractical == True\), \(A.room.type\) MUST be \('lab'\) and \(A.duration \ge 2\).</li>
                    <li><strong>Qualification Constraint:</strong> \(A.subjectId \in A.teacher.qualifiedSubjectIds\).</li>
                  </ol>
                </div>
              </div>

              {/* Substitute Logic */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Task 5: Substitute-Teacher Suggestion Heuristic
                </h3>
                <p className="text-xs text-slate-500">
                  Multi-criteria decision analysis (MCDA) that identifies, verifies, and ranks replacement faculty when a teacher reports absence.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
                  <p className="font-semibold text-slate-900">Suitability Scoring Formula (0 to 100 Points):</p>
                  <div className="p-3 bg-white rounded-lg border border-slate-300 font-mono text-xs space-y-1">
                    <p><code>SuitabilityScore = W_workload + W_continuity + W_dept + W_pref</code></p>
                    <p className="text-slate-500 mt-1">Where:</p>
                    <p>• <strong>W_workload (0–35 pts):</strong> {'((MaxHours - CurrentAssignedHours) / MaxHours) * 35'} (Fairness: prioritizes faculty with lighter load).</p>
                    <p>• <strong>W_continuity (0–30 pts):</strong> +30 pts if teacher already has an adjacent class that day; +20 pts if already on campus; +5 pts if off day.</p>
                    <p>• <strong>W_dept (0–20 pts):</strong> +20 pts if teacher belongs to the same department as the absent faculty member.</p>
                    <p>• <strong>W_pref (0–15 pts):</strong> +15 pts if target day is within teacher's explicitly configured preferred teaching days.</p>
                  </div>
                  <p className="text-slate-600">
                    <strong>Zero-Tolerance Filter:</strong> If candidate is already booked or marked on leave, score is heavily discounted and candidate is flagged as <em>Unavailable</em>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Task 6: REST API Specification
                </h3>
                <p className="text-xs text-slate-500">
                  Clean RESTful architecture with endpoints for timetable generation, validation, manual override, and substitutions.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Method</th>
                      <th className="p-3">Endpoint</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Payload / Query</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-emerald-600">POST</td>
                      <td className="p-3">/api/timetable/generate</td>
                      <td className="p-3 font-sans">Trigger CSP solver to generate clash-free schedule</td>
                      <td className="p-3 font-sans"><code>&#123; divisionIds, config &#125;</code></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-blue-600">GET</td>
                      <td className="p-3">/api/timetable</td>
                      <td className="p-3 font-sans">Fetch timetable filtered by division, teacher, or room</td>
                      <td className="p-3 font-sans"><code>?divisionId=...&amp;teacherId=...</code></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-emerald-600">POST</td>
                      <td className="p-3">/api/timetable/validate</td>
                      <td className="p-3 font-sans">Test proposed manual slot move for clashes</td>
                      <td className="p-3 font-sans"><code>&#123; entryId, newDay, newSlot, roomId, teacherId &#125;</code></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-amber-600">PUT</td>
                      <td className="p-3">/api/timetable/entries/:id</td>
                      <td className="p-3 font-sans">Commit manual slot modification (admin override)</td>
                      <td className="p-3 font-sans"><code>&#123; slotIndex, day, roomId, teacherId &#125;</code></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-blue-600">GET</td>
                      <td className="p-3">/api/substitutes/candidates</td>
                      <td className="p-3 font-sans">Query ranked substitute teachers for absent faculty</td>
                      <td className="p-3 font-sans"><code>?absentTeacherId=...&amp;subjectId=...&amp;day=...&amp;slot=...</code></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-emerald-600">POST</td>
                      <td className="p-3">/api/substitutes/assign</td>
                      <td className="p-3 font-sans">Assign substitute and trigger notification dispatch</td>
                      <td className="p-3 font-sans"><code>&#123; entryId, substituteTeacherId, date, reason &#125;</code></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-blue-600">GET</td>
                      <td className="p-3">/api/notifications</td>
                      <td className="p-3 font-sans">Fetch active alerts for student or faculty user</td>
                      <td className="p-3 font-sans"><code>?role=student&amp;divisionId=...</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'uiux' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Task 7: Simple, Clean UI/UX Flow (Admin & Faculty/Student)
                </h3>
                <p className="text-xs text-slate-500">
                  Role-based workflows minimizing cognitive load with visual schedule feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-sm text-slate-900">Administrator Workflow</h4>
                  </div>
                  <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600">
                    <li>
                      <strong>Entity Setup:</strong> Add/verify faculty workloads, classroom capacities, and subject lecture/lab hour requirements.
                    </li>
                    <li>
                      <strong>1-Click CSP Generation:</strong> Configure soft weights (gap reduction, day distribution) and launch solver. Live progress & stats (clash-free 100%, soft score) display immediately.
                    </li>
                    <li>
                      <strong>Interactive Drag & Drop / Edit:</strong> Click any lecture card. Modal tests new slot in real time; if clash detected, shows exact reason (e.g. <em>Prof. Sharma double-booked</em>) with resolution suggestions.
                    </li>
                    <li>
                      <strong>Absence Management:</strong> Mark faculty on leave, review AI-ranked substitute candidates, and assign with automated in-app alerts.
                    </li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900">Faculty & Student Workflow</h4>
                  </div>
                  <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600">
                    <li>
                      <strong>Personalized View:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li><strong>Students:</strong> Select Division (e.g., CS-3A) to view unified weekly schedule with classroom & lab locations.</li>
                        <li><strong>Faculty:</strong> Filter by their name to view teaching hours, free slots, and assigned lecture halls.</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Color-Coded Visual Rhythm:</strong> Theory vs 2-hour practical lab blocks are visually distinct with room tags and period indicators.
                    </li>
                    <li>
                      <strong>Notification Center:</strong> Bell icon flashes on timetable revisions or substitute assignments, showing precise slot changes.
                    </li>
                    <li>
                      <strong>Export & Print:</strong> Clean, high-contrast printable view formatted for student noticeboards.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Timetable CSP Engine • 100% Hard Constraint Satisfaction Guarantee
          </p>
          <button
            id="close-architecture-footer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
