import { DayOfWeek, Subject, SubstituteCandidate, Teacher, TimetableEntry } from '../types/timetable';
import { entriesOverlap } from './clashDetector';

/**
 * Finds and ranks qualified substitute teachers for an absent faculty member.
 */
export function findSubstituteTeachers(
  absentTeacherId: string,
  subjectId: string,
  day: DayOfWeek,
  slotIndex: number,
  durationSlots: number,
  allEntries: TimetableEntry[],
  teachers: Teacher[],
  subjects: Subject[]
): SubstituteCandidate[] {
  const subject = subjects.find((s) => s.id === subjectId);
  const absentTeacher = teachers.find((t) => t.id === absentTeacherId);

  // Compute current weekly load for each teacher
  const currentWorkloads = new Map<string, number>();
  for (const t of teachers) currentWorkloads.set(t.id, 0);

  for (const entry of allEntries) {
    const current = currentWorkloads.get(entry.teacherId) || 0;
    currentWorkloads.set(entry.teacherId, current + entry.durationSlots);
  }

  const targetSession = { day, slotIndex, durationSlots };

  const candidates: SubstituteCandidate[] = [];

  for (const candidate of teachers) {
    if (candidate.id === absentTeacherId) continue;

    const isQualified = candidate.qualifiedSubjectIds.includes(subjectId);
    if (!isQualified) continue; // Must be qualified

    const isAvailableStatus = candidate.isAvailable !== false;

    // Check time clash on the target slot
    let hasClash = false;
    let adjacentLecturesCount = 0;
    let lecturesTodayCount = 0;

    for (const entry of allEntries) {
      if (entry.teacherId === candidate.id) {
        if (entriesOverlap(entry, targetSession)) {
          hasClash = true;
        }
        if (entry.day === day) {
          lecturesTodayCount++;
          // Check if adjacent (1 period before or after)
          if (
            entry.slotIndex + entry.durationSlots === slotIndex ||
            slotIndex + durationSlots === entry.slotIndex
          ) {
            adjacentLecturesCount++;
          }
        }
      }
    }

    const isFree = !hasClash && isAvailableStatus;
    const currentHours = currentWorkloads.get(candidate.id) || 0;

    // Workload scoring (0 to 35 pts)
    const loadRemaining = Math.max(0, candidate.maxWeeklyHours - currentHours);
    const workloadScore = Math.min(35, Math.round((loadRemaining / candidate.maxWeeklyHours) * 35));

    // Schedule Continuity / Presence (0 to 30 pts)
    // If they already have a class today, especially adjacent, it's very convenient
    let scheduleContinuityScore = 10;
    if (adjacentLecturesCount > 0) {
      scheduleContinuityScore = 30; // Back-to-back, minimal waiting
    } else if (lecturesTodayCount > 0) {
      scheduleContinuityScore = 20; // Already on campus
    } else {
      scheduleContinuityScore = 5; // Off day, requires extra trip
    }

    // Department match (0 to 20 pts)
    let departmentMatchScore = 10;
    if (absentTeacher && candidate.department === absentTeacher.department) {
      departmentMatchScore = 20;
    }

    // Day preference (0 to 15 pts)
    let preferenceScore = 5;
    if (candidate.preferredDays?.includes(day)) {
      preferenceScore = 15;
    }

    // Total Suitability Score
    let suitabilityScore =
      workloadScore + scheduleContinuityScore + departmentMatchScore + preferenceScore;

    if (!isFree) {
      suitabilityScore = Math.min(15, Math.round(suitabilityScore * 0.2));
    }

    // Generate clear human-readable justification
    const reasons: string[] = [];
    if (!isFree) {
      reasons.push(hasClash ? 'Unavailable (Already scheduled for another lecture at this slot)' : 'Marked On Leave');
    } else {
      reasons.push(`Free at ${day} slot ${slotIndex + 1}`);
      reasons.push(`Current load: ${currentHours}/${candidate.maxWeeklyHours} hrs`);
      if (adjacentLecturesCount > 0) {
        reasons.push('Already has adjacent class on campus (Optimal continuity)');
      } else if (lecturesTodayCount > 0) {
        reasons.push('Present on campus today');
      }
      if (candidate.department === absentTeacher?.department) {
        reasons.push(`Same Department (${candidate.department})`);
      }
    }

    candidates.push({
      teacher: candidate,
      isFree,
      qualificationMatch: true,
      currentWeeklyHours: currentHours,
      maxWeeklyHours: candidate.maxWeeklyHours,
      suitabilityScore,
      scoringFactors: {
        workloadScore,
        scheduleContinuityScore,
        departmentMatchScore,
        preferenceScore,
      },
      reason: reasons.join(' • '),
    });
  }

  // Sort candidates: Free first, then highest suitability score
  candidates.sort((a, b) => {
    if (a.isFree !== b.isFree) {
      return a.isFree ? -1 : 1;
    }
    return b.suitabilityScore - a.suitabilityScore;
  });

  return candidates;
}
