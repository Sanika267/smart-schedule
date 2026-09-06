export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export interface TimeSlot {
  id: string; // e.g. "slot-1"
  periodIndex: number; // 0 to 7
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  isBreak?: boolean;
  label: string; // "09:00 - 10:00"
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  theoryHoursPerWeek: number; // e.g. 3 lectures/week (1 hr each)
  practicalHoursPerWeek: number; // e.g. 2 hours/week (1 block of 2 hrs)
  color: string;
  isLabRequired: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  qualifiedSubjectIds: string[];
  maxWeeklyHours: number;
  preferredDays?: DayOfWeek[];
  department: string;
  isAvailable?: boolean; // toggle for leave/absence
}

export interface Division {
  id: string;
  name: string; // e.g. "CS-Year3-A"
  department: string;
  semester: number;
  studentCount: number;
  subjectIds: string[];
  defaultClassroomId: string;
}

export type RoomType = 'classroom' | 'lab';

export interface Room {
  id: string;
  name: string; // e.g. "Room 101", "Lab 2A"
  type: RoomType;
  capacity: number;
  building: string;
}

export interface TimetableEntry {
  id: string;
  divisionId: string;
  subjectId: string;
  teacherId: string;
  originalTeacherId?: string; // set if substituted
  isSubstituted?: boolean;
  substitutionReason?: string;
  roomId: string;
  day: DayOfWeek;
  slotIndex: number; // 0 to 7
  durationSlots: number; // 1 for theory, 2 for practical block
  isPractical: boolean;
  batch?: string; // e.g. "Batch 1", "All"
}

export interface ClashIssue {
  type: 'teacher' | 'room' | 'division' | 'qualification' | 'lab_requirement' | 'lunch_overlap';
  severity: 'error' | 'warning';
  message: string;
  conflictingEntryId?: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  clashes: ClashIssue[];
  warnings: ClashIssue[];
}

export interface SubstituteCandidate {
  teacher: Teacher;
  isFree: boolean;
  qualificationMatch: boolean;
  currentWeeklyHours: number;
  maxWeeklyHours: number;
  suitabilityScore: number; // 0 to 100
  scoringFactors: {
    workloadScore: number;
    scheduleContinuityScore: number;
    departmentMatchScore: number;
    preferenceScore: number;
  };
  reason: string;
}

export interface TimetableNotification {
  id: string;
  timestamp: string;
  type: 'substitution' | 'room_change' | 'time_change' | 'full_generation' | 'clash_detected';
  title: string;
  message: string;
  targetRole: 'all' | 'faculty' | 'student';
  affectedDivisionId?: string;
  affectedTeacherId?: string;
  read: boolean;
}

export interface GenerationStats {
  durationMs: number;
  totalAssignments: number;
  backtrackCount: number;
  hardConstraintsMet: boolean;
  hardConstraintScore: number; // 100%
  softConstraintScore: number; // 0-100%
  metrics: {
    teacherGaps: number;
    divisionGaps: number;
    balancedDaysScore: number;
    preferredSlotsScore: number;
  };
}

export interface SolverConfig {
  respectTeacherPreferences: boolean;
  minimizeGaps: boolean;
  spreadSubjectsEvenly: boolean;
  balanceTeacherLoad: boolean;
  allowBacktrackingLimit: number;
}

export interface CoordinatorDataFile {
  collegeName: string;
  department: string;
  academicYear: string;
  lastUpdated?: string;
  lastSavedAt?: string;
  version: string;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  divisions: Division[];
  solverConfig?: SolverConfig;
}

export interface FeasibilityIssue {
  type: 'error' | 'warning';
  category: 'subjects' | 'teachers' | 'rooms' | 'labs' | 'divisions';
  title: string;
  description: string;
  actionTab?: 'subjects' | 'teachers' | 'rooms' | 'divisions';
}

export interface FeasibilityReport {
  isFeasible: boolean;
  errors: FeasibilityIssue[];
  warnings: FeasibilityIssue[];
  totalWeeklyHoursRequired: number;
  totalTeacherCapacityHours: number;
  theoryRoomsAvailable: number;
  labRoomsAvailable: number;
  theorySlotsNeeded: number;
  practicalSlotsNeeded: number;
}
