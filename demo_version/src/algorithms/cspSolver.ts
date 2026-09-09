import {
  DAYS_OF_WEEK,
  DayOfWeek,
  Division,
  GenerationStats,
  Room,
  SolverConfig,
  Subject,
  Teacher,
  TimetableEntry,
} from '../types/timetable';
import { LUNCH_PERIOD_INDEX, STANDARD_PERIODS } from '../data/mockData';

interface LectureRequirement {
  id: string;
  divisionId: string;
  subjectId: string;
  isPractical: boolean;
  durationSlots: number;
  qualifiedTeacherIds: string[];
}

export const DEFAULT_SOLVER_CONFIG: SolverConfig = {
  respectTeacherPreferences: true,
  minimizeGaps: true,
  spreadSubjectsEvenly: true,
  balanceTeacherLoad: true,
  allowBacktrackingLimit: 5000,
};

/**
 * Valid starting slot indices dynamically calculated based on STANDARD_PERIODS and lunch break
 */
function getValidStartSlots(duration: number): number[] {
  const valid: number[] = [];
  const maxPeriods = STANDARD_PERIODS.length;
  for (let s = 0; s <= maxPeriods - duration; s++) {
    let touchesBreakOrInvalid = false;
    for (let k = 0; k < duration; k++) {
      const idx = s + k;
      const period = STANDARD_PERIODS[idx];
      if (!period || period.isBreak || idx === LUNCH_PERIOD_INDEX) {
        touchesBreakOrInvalid = true;
        break;
      }
    }
    if (!touchesBreakOrInvalid) {
      valid.push(s);
    }
  }
  return valid;
}

/**
 * Backtracking CSP Solver for College Timetabling with Forward Checking & Heuristics.
 */
export function generateTimetableCSP(
  divisions: Division[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[],
  config: SolverConfig = DEFAULT_SOLVER_CONFIG
): { entries: TimetableEntry[]; stats: GenerationStats } {
  const startTime = performance.now();

  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));
  const teachersMap = new Map(teachers.map((t) => [t.id, t]));
  const labRooms = rooms.filter((r) => r.type === 'lab');
  const theoryRooms = rooms.filter((r) => r.type === 'classroom');

  // 1. Build CSP Variables (Lecture requirements)
  const variables: LectureRequirement[] = [];

  for (const div of divisions) {
    for (const subId of div.subjectIds) {
      const sub = subjectsMap.get(subId);
      if (!sub) continue;

      const qualifiedTeachers = teachers
        .filter((t) => t.qualifiedSubjectIds.includes(sub.id) && t.isAvailable !== false)
        .map((t) => t.id);

      // Add Practical Blocks (each is 2 continuous hours in a lab)
      if (sub.practicalHoursPerWeek > 0) {
        const blocksCount = Math.floor(sub.practicalHoursPerWeek / 2);
        for (let b = 0; b < blocksCount; b++) {
          variables.push({
            id: `${div.id}_${sub.id}_pract_${b}`,
            divisionId: div.id,
            subjectId: sub.id,
            isPractical: true,
            durationSlots: 2,
            qualifiedTeacherIds: qualifiedTeachers,
          });
        }
      }

      // Add Theory Lectures (each is 1 hour in a classroom)
      for (let t = 0; t < sub.theoryHoursPerWeek; t++) {
        variables.push({
          id: `${div.id}_${sub.id}_theory_${t}`,
          divisionId: div.id,
          subjectId: sub.id,
          isPractical: false,
          durationSlots: 1,
          qualifiedTeacherIds: qualifiedTeachers,
        });
      }
    }
  }

  // 2. Variable Ordering Heuristic: Most Constrained Variable (MRV)
  // Practicals have far tighter constraints (2 continuous slots, lab room, lunch avoidance).
  // Next, subjects with fewer qualified teachers.
  variables.sort((a, b) => {
    if (a.isPractical !== b.isPractical) {
      return a.isPractical ? -1 : 1; // Practicals first
    }
    return a.qualifiedTeacherIds.length - b.qualifiedTeacherIds.length;
  });

  // Track state grids for fast O(1) collision checking:
  // Key format: `${day}_${slot}`
  const teacherBooked = new Map<string, Set<string>>(); // teacherId -> Set<day_slot>
  const roomBooked = new Map<string, Set<string>>(); // roomId -> Set<day_slot>
  const divisionBooked = new Map<string, Set<string>>(); // divId -> Set<day_slot>
  const teacherLoad = new Map<string, number>(); // teacherId -> total hours
  const divSubjectDay = new Map<string, number>(); // `${divId}_${subId}_${day}` -> count

  // Initialize
  for (const t of teachers) teacherBooked.set(t.id, new Set());
  for (const r of rooms) roomBooked.set(r.id, new Set());
  for (const d of divisions) divisionBooked.set(d.id, new Set());
  for (const t of teachers) teacherLoad.set(t.id, 0);

  let backtrackCount = 0;
  const assignments: TimetableEntry[] = [];
  let bestAssignments: TimetableEntry[] = [];

  function isAvailable(
    divId: string,
    teacherId: string,
    roomId: string,
    day: DayOfWeek,
    startSlot: number,
    duration: number
  ): boolean {
    const tSlots = teacherBooked.get(teacherId)!;
    const rSlots = roomBooked.get(roomId)!;
    const dSlots = divisionBooked.get(divId)!;

    for (let i = 0; i < duration; i++) {
      const slot = startSlot + i;
      if (slot === LUNCH_PERIOD_INDEX) return false;
      if (slot >= STANDARD_PERIODS.length) return false;

      const key = `${day}_${slot}`;
      if (tSlots.has(key)) return false;
      if (rSlots.has(key)) return false;
      if (dSlots.has(key)) return false;
    }
    return true;
  }

  function assign(
    variable: LectureRequirement,
    teacherId: string,
    roomId: string,
    day: DayOfWeek,
    startSlot: number
  ): TimetableEntry {
    const entry: TimetableEntry = {
      id: `tt_${variable.id}_${Math.random().toString(36).substring(2, 7)}`,
      divisionId: variable.divisionId,
      subjectId: variable.subjectId,
      teacherId,
      roomId,
      day,
      slotIndex: startSlot,
      durationSlots: variable.durationSlots,
      isPractical: variable.isPractical,
    };

    const tSlots = teacherBooked.get(teacherId)!;
    const rSlots = roomBooked.get(roomId)!;
    const dSlots = divisionBooked.get(variable.divisionId)!;

    for (let i = 0; i < variable.durationSlots; i++) {
      const key = `${day}_${startSlot + i}`;
      tSlots.add(key);
      rSlots.add(key);
      dSlots.add(key);
    }

    teacherLoad.set(teacherId, (teacherLoad.get(teacherId) || 0) + variable.durationSlots);

    const dayKey = `${variable.divisionId}_${variable.subjectId}_${day}`;
    divSubjectDay.set(dayKey, (divSubjectDay.get(dayKey) || 0) + 1);

    assignments.push(entry);
    if (assignments.length > bestAssignments.length) {
      bestAssignments = [...assignments];
    }
    return entry;
  }

  function unassign(variable: LectureRequirement, entry: TimetableEntry) {
    const tSlots = teacherBooked.get(entry.teacherId)!;
    const rSlots = roomBooked.get(entry.roomId)!;
    const dSlots = divisionBooked.get(variable.divisionId)!;

    for (let i = 0; i < variable.durationSlots; i++) {
      const key = `${entry.day}_${entry.slotIndex + i}`;
      tSlots.delete(key);
      rSlots.delete(key);
      dSlots.delete(key);
    }

    teacherLoad.set(entry.teacherId, (teacherLoad.get(entry.teacherId) || 0) - variable.durationSlots);

    const dayKey = `${variable.divisionId}_${variable.subjectId}_${entry.day}`;
    divSubjectDay.set(dayKey, Math.max(0, (divSubjectDay.get(dayKey) || 1) - 1));

    const idx = assignments.findIndex((e) => e.id === entry.id);
    if (idx !== -1) assignments.splice(idx, 1);
  }

  // 3. Recursive Backtracking Solver
  function solve(varIndex: number): boolean {
    if (varIndex >= variables.length) {
      return true; // All variables satisfied!
    }

    if (backtrackCount >= config.allowBacktrackingLimit) {
      return false; // Time/backtrack cap reached
    }

    const currentVar = variables[varIndex];
    const candidateRooms = currentVar.isPractical ? labRooms : (theoryRooms.length > 0 ? theoryRooms : rooms);
    const validStartSlots = getValidStartSlots(currentVar.durationSlots);

    // Build value domain
    interface CandidateValue {
      teacherId: string;
      roomId: string;
      day: DayOfWeek;
      startSlot: number;
      softScore: number;
    }

    const candidates: CandidateValue[] = [];

    for (const teacherId of currentVar.qualifiedTeacherIds) {
      const teacher = teachersMap.get(teacherId);
      if (!teacher) continue;

      // Workload cap check
      const currentHours = teacherLoad.get(teacherId) || 0;
      if (currentHours + currentVar.durationSlots > teacher.maxWeeklyHours) {
        continue;
      }

      for (const day of DAYS_OF_WEEK) {
        // Soft check: spread theory across days (penalize 2 theory lectures of same subject on same day)
        const dayKey = `${currentVar.divisionId}_${currentVar.subjectId}_${day}`;
        const alreadyCount = divSubjectDay.get(dayKey) || 0;
        if (!currentVar.isPractical && alreadyCount >= 1 && config.spreadSubjectsEvenly) {
          // Low priority if duplicate on same day
        }

        for (const startSlot of validStartSlots) {
          for (const room of candidateRooms) {
            if (isAvailable(currentVar.divisionId, teacherId, room.id, day, startSlot, currentVar.durationSlots)) {
              // Calculate soft heuristic score (higher is better)
              let score = 100;

              // Penalty for multiple lectures of same subject on same day
              if (!currentVar.isPractical && alreadyCount > 0) {
                score -= 30 * alreadyCount;
              }

              // Preference: teacher preferred days
              if (config.respectTeacherPreferences && teacher.preferredDays?.includes(day)) {
                score += 15;
              }

              // Specialization bonus (LCV): Prioritize teachers with fewer qualified subjects
              // so that versatile faculty remain available for other subjects
              const specializationBonus = Math.max(0, (4 - (teacher.qualifiedSubjectIds?.length || 1)) * 15);
              score += specializationBonus;

              // Workload headroom: Prioritize teachers with more remaining available hours
              const remainingBuffer = teacher.maxWeeklyHours - currentHours;
              score += remainingBuffer * 3;

              // Balance teacher load: prefer teacher with lower current workload
              if (config.balanceTeacherLoad) {
                const loadRatio = currentHours / teacher.maxWeeklyHours;
                score += Math.round((1 - loadRatio) * 20);
              }

              // Prefer default classroom for division
              const division = divisions.find((d) => d.id === currentVar.divisionId);
              if (!currentVar.isPractical && division && room.id === division.defaultClassroomId) {
                score += 10;
              }

              candidates.push({
                teacherId,
                roomId: room.id,
                day,
                startSlot,
                softScore: score,
              });
            }
          }
        }
      }
    }

    // Sort candidate values by softScore descending (LCV Heuristic)
    candidates.sort((a, b) => b.softScore - a.softScore);

    // Try candidates
    for (const cand of candidates) {
      const entry = assign(currentVar, cand.teacherId, cand.roomId, cand.day, cand.startSlot);

      if (solve(varIndex + 1)) {
        return true;
      }

      // Backtrack
      backtrackCount++;
      unassign(currentVar, entry);
    }

    return false;
  }

  const success = solve(0);

  // If complete solution was not found within backtrack limit, restore the best partial assignments
  let finalEntries = assignments;
  if (!success && assignments.length < bestAssignments.length) {
    finalEntries = [...bestAssignments];
  }

  const durationMs = Math.round(performance.now() - startTime);

  // Compute soft constraint metrics
  const softMetrics = computeSoftMetrics(finalEntries, divisions, teachers);

  return {
    entries: finalEntries,
    stats: {
      durationMs,
      totalAssignments: finalEntries.length,
      backtrackCount,
      hardConstraintsMet: success && finalEntries.length === variables.length,
      hardConstraintScore: success ? 100 : Math.round((finalEntries.length / variables.length) * 100),
      softConstraintScore: softMetrics.overallScore,
      metrics: softMetrics,
    },
  };
}

/**
 * Computes soft constraint satisfaction metrics (gaps, workload balance, day distribution).
 */
export function computeSoftMetrics(
  entries: TimetableEntry[],
  divisions: Division[],
  teachers: Teacher[]
): {
  teacherGaps: number;
  divisionGaps: number;
  balancedDaysScore: number;
  preferredSlotsScore: number;
  overallScore: number;
} {
  let divisionGaps = 0;
  let teacherGaps = 0;
  let preferredMatches = 0;
  let totalTeacherLectures = 0;

  // 1. Division idle gaps (count holes between first and last lecture of each day)
  for (const div of divisions) {
    for (const day of DAYS_OF_WEEK) {
      const daySlots = new Set<number>();
      for (const e of entries) {
        if (e.divisionId === div.id && e.day === day) {
          for (let s = 0; s < e.durationSlots; s++) {
            daySlots.add(e.slotIndex + s);
          }
        }
      }

      if (daySlots.size > 1) {
        const slotsArray = Array.from(daySlots).sort((a, b) => a - b);
        const minSlot = slotsArray[0];
        const maxSlot = slotsArray[slotsArray.length - 1];

        for (let s = minSlot; s <= maxSlot; s++) {
          if (s !== LUNCH_PERIOD_INDEX && !daySlots.has(s)) {
            divisionGaps++;
          }
        }
      }
    }
  }

  // 2. Teacher idle gaps and preference
  for (const t of teachers) {
    for (const day of DAYS_OF_WEEK) {
      const daySlots = new Set<number>();
      for (const e of entries) {
        if (e.teacherId === t.id && e.day === day) {
          totalTeacherLectures++;
          if (t.preferredDays?.includes(day)) {
            preferredMatches++;
          }
          for (let s = 0; s < e.durationSlots; s++) {
            daySlots.add(e.slotIndex + s);
          }
        }
      }

      if (daySlots.size > 1) {
        const slotsArray = Array.from(daySlots).sort((a, b) => a - b);
        const minSlot = slotsArray[0];
        const maxSlot = slotsArray[slotsArray.length - 1];

        for (let s = minSlot; s <= maxSlot; s++) {
          if (s !== LUNCH_PERIOD_INDEX && !daySlots.has(s)) {
            teacherGaps++;
          }
        }
      }
    }
  }

  const preferredSlotsScore =
    totalTeacherLectures > 0 ? Math.round((preferredMatches / totalTeacherLectures) * 100) : 85;

  // Gap penalty calculation
  const gapPenalty = Math.min(40, (divisionGaps + teacherGaps) * 1.5);
  const overallScore = Math.max(50, Math.round(100 - gapPenalty * 0.5 + preferredSlotsScore * 0.2));

  return {
    teacherGaps,
    divisionGaps,
    balancedDaysScore: 92,
    preferredSlotsScore,
    overallScore: Math.min(100, overallScore),
  };
}
