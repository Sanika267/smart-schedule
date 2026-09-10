import {
  ClashIssue,
  DayOfWeek,
  Division,
  Room,
  Subject,
  Teacher,
  TimetableEntry,
  ValidationResult,
} from '../types/timetable';
import { LUNCH_PERIOD_INDEX } from '../data/mockData';

/**
 * Returns an array of slot indices occupied by an entry.
 * e.g. a 1-slot theory at slot 1 occupies [1]
 * a 2-slot practical at slot 5 occupies [5, 6]
 */
export function getOccupiedSlots(slotIndex: number, duration: number): number[] {
  const slots: number[] = [];
  for (let i = 0; i < duration; i++) {
    slots.push(slotIndex + i);
  }
  return slots;
}

/**
 * Checks if two entries overlap in time on the same day.
 */
export function entriesOverlap(
  entryA: { day: DayOfWeek; slotIndex: number; durationSlots: number },
  entryB: { day: DayOfWeek; slotIndex: number; durationSlots: number }
): boolean {
  if (entryA.day !== entryB.day) return false;

  const aStart = entryA.slotIndex;
  const aEnd = entryA.slotIndex + entryA.durationSlots;
  const bStart = entryB.slotIndex;
  const bEnd = entryB.slotIndex + entryB.durationSlots;

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Comprehensive clash validation for a single timetable entry against all other entries.
 */
export function validateSlotAssignment(
  candidate: Omit<TimetableEntry, 'id'> & { id?: string },
  allEntries: TimetableEntry[],
  teachers: Teacher[],
  rooms: Room[],
  subjects: Subject[],
  divisions: Division[]
): ValidationResult {
  const clashes: ClashIssue[] = [];
  const warnings: ClashIssue[] = [];

  const candidateId = candidate.id;
  const candidateSlots = getOccupiedSlots(candidate.slotIndex, candidate.durationSlots);

  // 1. Boundary & Lunch Check
  if (candidate.slotIndex < 0 || candidate.slotIndex + candidate.durationSlots > 8) {
    clashes.push({
      type: 'lunch_overlap',
      severity: 'error',
      message: `Scheduled time exceeds daily college hours (09:00 - 17:00).`,
    });
  }

  if (candidateSlots.includes(LUNCH_PERIOD_INDEX)) {
    clashes.push({
      type: 'lunch_overlap',
      severity: 'error',
      message: `Cannot schedule classes during Lunch Break (13:00 - 14:00).`,
    });
  }

  const subject = subjects.find((s) => s.id === candidate.subjectId);
  const teacher = teachers.find((t) => t.id === candidate.teacherId);
  const room = rooms.find((r) => r.id === candidate.roomId);
  const division = divisions.find((d) => d.id === candidate.divisionId);

  // 2. Teacher Qualification Check
  if (teacher && subject) {
    if (!teacher.qualifiedSubjectIds.includes(subject.id)) {
      clashes.push({
        type: 'qualification',
        severity: 'error',
        message: `${teacher.name} is not certified/qualified to teach ${subject.name} (${subject.code}).`,
      });
    }

    if (teacher.isAvailable === false) {
      clashes.push({
        type: 'teacher',
        severity: 'error',
        message: `${teacher.name} is marked as On Leave / Unavailable.`,
      });
    }
  }

  // 3. Room Type Check (Practicals must be in labs; Theory in classrooms or labs)
  if (candidate.isPractical && room && room.type !== 'lab') {
    clashes.push({
      type: 'lab_requirement',
      severity: 'error',
      message: `Practical lab session for ${subject?.name || 'subject'} must be held in a specialized Lab, not ${room.name}.`,
    });
  }

  if (candidate.isPractical && candidate.durationSlots < 2) {
    clashes.push({
      type: 'lab_requirement',
      severity: 'error',
      message: `Practicals must be scheduled in continuous 2-hour blocks.`,
    });
  }

  // 4. Overlap Checks against other scheduled lectures
  for (const other of allEntries) {
    // Skip checking against itself if editing
    if (candidateId && other.id === candidateId) continue;

    // Check if overlapping time on same day
    if (!entriesOverlap(candidate, other)) continue;

    // Hard Constraint 1: Teacher Clash
    if (other.teacherId === candidate.teacherId) {
      const otherDiv = divisions.find((d) => d.id === other.divisionId)?.name || other.divisionId;
      const otherSub = subjects.find((s) => s.id === other.subjectId)?.code || other.subjectId;
      clashes.push({
        type: 'teacher',
        severity: 'error',
        conflictingEntryId: other.id,
        message: `Teacher Collision: ${teacher?.name || 'Faculty'} is already booked with ${otherDiv} for ${otherSub} at this time.`,
        details: { otherEntry: other },
      });
    }

    // Hard Constraint 2: Room Clash
    if (other.roomId === candidate.roomId) {
      const otherDiv = divisions.find((d) => d.id === other.divisionId)?.name || other.divisionId;
      clashes.push({
        type: 'room',
        severity: 'error',
        conflictingEntryId: other.id,
        message: `Room Collision: ${room?.name || 'Room'} is occupied by ${otherDiv} at this time.`,
        details: { otherEntry: other },
      });
    }

    // Hard Constraint 3: Division Clash
    if (other.divisionId === candidate.divisionId) {
      const otherSub = subjects.find((s) => s.id === other.subjectId)?.name || other.subjectId;
      clashes.push({
        type: 'division',
        severity: 'error',
        conflictingEntryId: other.id,
        message: `Division Collision: ${division?.name || 'Division'} already has a session (${otherSub}) scheduled at this time.`,
        details: { otherEntry: other },
      });
    }
  }

  // 5. Soft Constraints / Warnings
  if (clashes.length === 0) {
    // Check if division already has this subject on the same day (theory)
    if (!candidate.isPractical) {
      const sameDaySubjectTheory = allEntries.filter(
        (e) =>
          e.id !== candidateId &&
          e.divisionId === candidate.divisionId &&
          e.subjectId === candidate.subjectId &&
          e.day === candidate.day &&
          !e.isPractical
      );
      if (sameDaySubjectTheory.length > 0) {
        warnings.push({
          type: 'division',
          severity: 'warning',
          message: `${division?.name || 'Division'} already has a theory lecture of ${subject?.code} scheduled on ${candidate.day}. Spreading across days is recommended.`,
        });
      }
    }

    // Teacher preferred day check
    if (teacher?.preferredDays && teacher.preferredDays.length > 0) {
      if (!teacher.preferredDays.includes(candidate.day)) {
        warnings.push({
          type: 'teacher',
          severity: 'warning',
          message: `${teacher.name} prefers teaching on ${teacher.preferredDays.join(', ')} rather than ${candidate.day}.`,
        });
      }
    }
  }

  return {
    isValid: clashes.length === 0,
    clashes,
    warnings,
  };
}

/**
 * Runs a full clash audit on the entire timetable.
 */
export function auditTimetable(
  entries: TimetableEntry[],
  teachers: Teacher[],
  rooms: Room[],
  subjects: Subject[],
  divisions: Division[]
): ClashIssue[] {
  const allClashes: ClashIssue[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      if (entriesOverlap(a, b)) {
        if (a.teacherId === b.teacherId) {
          const teacher = teachers.find((t) => t.id === a.teacherId);
          allClashes.push({
            type: 'teacher',
            severity: 'error',
            message: `Faculty clash: ${teacher?.name || a.teacherId} double booked on ${a.day}.`,
          });
        }
        if (a.roomId === b.roomId) {
          const room = rooms.find((r) => r.id === a.roomId);
          allClashes.push({
            type: 'room',
            severity: 'error',
            message: `Room clash: ${room?.name || a.roomId} double booked on ${a.day}.`,
          });
        }
        if (a.divisionId === b.divisionId) {
          const div = divisions.find((d) => d.id === a.divisionId);
          allClashes.push({
            type: 'division',
            severity: 'error',
            message: `Division clash: ${div?.name || a.divisionId} scheduled for two sessions simultaneously on ${a.day}.`,
          });
        }
      }
    }
  }

  return allClashes;
}
