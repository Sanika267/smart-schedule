const { DAYS, TIME_SLOTS, LUNCH_SLOT_INDEX } = require('../config/constants');

/**
 * Constraint-satisfaction timetable generator.
 *
 * Hard constraints enforced (never violated):
 *  1. A teacher cannot be scheduled for two different divisions at the same day+time.
 *  2. A classroom cannot host two different divisions at the same day+time.
 *  3. A division has exactly one session per day+time (no double-booking itself).
 *  4. The lunch break slot (index 3, "12:00 - 01:00") is never assigned a real class.
 *
 * Soft goals (best-effort, improve quality but never break hard constraints):
 *  - Spread a subject's lectures across different days rather than stacking them.
 *  - Avoid scheduling the same subject twice on the same day for a division.
 *  - Lab sessions are scheduled as two consecutive slots (Batch A / Batch B).
 *
 * Algorithm: randomized greedy placement with backtracking. For every
 * division we build a queue of "sessions to place" (derived from each
 * subject's lecturesPerWeek / labHoursPerWeek). We shuffle divisions and
 * sessions, then for each session try day/slot combinations, skipping any
 * that would violate a hard constraint, until every session is placed or a
 * fixed number of retries is exhausted (in which case we relax the "same
 * subject same day" soft rule and try again).
 */

function buildSessionQueue(subjects) {
  const sessions = [];

  subjects.forEach((subject) => {
    const subjectId = String(subject._id);
    const teacherId = String(subject.teacher._id || subject.teacher);
    const teacherName = subject.teacher.name || subject.teacherName;
    const classroomId = subject.preferredClassroom
      ? String(subject.preferredClassroom._id || subject.preferredClassroom)
      : null;
    const classroomName = subject.preferredClassroom
      ? subject.preferredClassroom.name || subject.classroomName
      : null;

    for (let i = 0; i < (subject.lecturesPerWeek || 0); i += 1) {
      sessions.push({
        subjectId,
        subjectName: subject.name,
        teacherId,
        teacherName,
        classroomId,
        classroomName,
        type: 'Lecture',
        length: 1
      });
    }

    // Labs are placed as a 2-slot consecutive block per "labHoursPerWeek / 2"
    const labBlocks = Math.round((subject.labHoursPerWeek || 0) / 2);
    for (let i = 0; i < labBlocks; i += 1) {
      sessions.push({
        subjectId,
        subjectName: `${subject.name} Lab`,
        teacherId,
        teacherName,
        classroomId,
        classroomName,
        type: 'Lab',
        length: 2
      });
    }
  });

  return sessions;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const usableSlotIndices = TIME_SLOTS.map((_, idx) => idx).filter((idx) => idx !== LUNCH_SLOT_INDEX);

/**
 * @param {Array} divisionsWithSubjects - [{ division, room, subjects: [...] }]
 * @param {Object} options - { maxAttemptsPerSession, allowSameDayRepeat }
 * @returns {{ placed: Array, unplaced: Array, warnings: Array }}
 */
function generateTimetable(divisionsWithSubjects, options = {}) {
  const maxAttemptsPerSession = options.maxAttemptsPerSession || 60;

  // Global occupancy trackers, keyed by `${day}|${slotIndex}`
  const teacherBusy = new Map(); // key -> Set of teacherIds
  const classroomBusy = new Map(); // key -> Set of classroomIds

  const key = (day, slotIndex) => `${day}|${slotIndex}`;

  const isTeacherFree = (teacherId, day, slotIndex) => {
    if (!teacherId) return true;
    const busy = teacherBusy.get(key(day, slotIndex));
    return !busy || !busy.has(teacherId);
  };

  const isClassroomFree = (classroomId, day, slotIndex) => {
    if (!classroomId) return true;
    const busy = classroomBusy.get(key(day, slotIndex));
    return !busy || !busy.has(classroomId);
  };

  const markBusy = (teacherId, classroomId, day, slotIndex) => {
    const k = key(day, slotIndex);
    if (teacherId) {
      if (!teacherBusy.has(k)) teacherBusy.set(k, new Set());
      teacherBusy.get(k).add(teacherId);
    }
    if (classroomId) {
      if (!classroomBusy.has(k)) classroomBusy.set(k, new Set());
      classroomBusy.get(k).add(classroomId);
    }
  };

  const placed = [];
  const unplaced = [];
  const warnings = [];

  divisionsWithSubjects.forEach(({ division, subjects }) => {
    const divisionId = String(division._id);
    const divisionOccupied = new Set(); // slotIndex per day already filled for THIS division
    const sameDaySubjectCount = new Map(); // `${day}|${subjectId}` -> count

    const sessions = shuffle(buildSessionQueue(subjects));

    sessions.forEach((session) => {
      let attempt = 0;
      let placedThisSession = false;
      let allowRepeat = false;

      while (attempt < maxAttemptsPerSession && !placedThisSession) {
        attempt += 1;
        if (attempt > maxAttemptsPerSession / 2) allowRepeat = true; // relax soft rule if stuck

        const day = DAYS[Math.floor(Math.random() * DAYS.length)];
        const candidateSlots =
          session.length === 2
            ? shuffle(usableSlotIndices.filter((idx) => usableSlotIndices.includes(idx + 1) && idx + 1 !== LUNCH_SLOT_INDEX))
            : shuffle(usableSlotIndices);

        for (const startIdx of candidateSlots) {
          const slotIndices = session.length === 2 ? [startIdx, startIdx + 1] : [startIdx];

          const divisionSlotFree = slotIndices.every(
            (idx) => !divisionOccupied.has(`${day}|${idx}`)
          );
          if (!divisionSlotFree) continue;

          const teacherFree = slotIndices.every((idx) => isTeacherFree(session.teacherId, day, idx));
          if (!teacherFree) continue;

          const classroomFree = slotIndices.every((idx) => isClassroomFree(session.classroomId, day, idx));
          if (!classroomFree) continue;

          const sameDayKey = `${day}|${session.subjectId}`;
          const sameDayCount = sameDaySubjectCount.get(sameDayKey) || 0;
          if (sameDayCount >= 1 && !allowRepeat) continue; // soft rule: avoid repeating a subject same day

          // All checks passed - commit this placement
          slotIndices.forEach((idx) => {
            divisionOccupied.add(`${day}|${idx}`);
            markBusy(session.teacherId, session.classroomId, day, idx);
            placed.push({
              division: divisionId,
              day,
              time: TIME_SLOTS[idx],
              subject: session.subjectName,
              subjectRef: session.subjectId,
              teacher: session.teacherName || '-',
              teacherRef: session.teacherId || null,
              classroom: session.classroomName || '-',
              classroomRef: session.classroomId || null,
              type: session.type
            });
          });

          sameDaySubjectCount.set(sameDayKey, sameDayCount + 1);
          placedThisSession = true;
          break;
        }
      }

      if (!placedThisSession) {
        unplaced.push({
          division: divisionId,
          subject: session.subjectName,
          teacher: session.teacherName,
          type: session.type,
          reason: 'No conflict-free slot found within attempt budget'
        });
      }
    });

    // Fill every remaining empty slot (including lunch) so the grid is complete
    DAYS.forEach((day) => {
      TIME_SLOTS.forEach((time, idx) => {
        const already = placed.find(
          (p) => p.division === divisionId && p.day === day && p.time === time
        );
        if (already) return;

        if (idx === LUNCH_SLOT_INDEX) {
          placed.push({
            division: divisionId,
            day,
            time,
            subject: 'Lunch Break',
            subjectRef: null,
            teacher: '-',
            teacherRef: null,
            classroom: 'Cafeteria',
            classroomRef: null,
            type: 'Break'
          });
        } else {
          placed.push({
            division: divisionId,
            day,
            time,
            subject: 'Free / Self Study',
            subjectRef: null,
            teacher: '-',
            teacherRef: null,
            classroom: '-',
            classroomRef: null,
            type: 'Activity'
          });
        }
      });
    });
  });

  if (unplaced.length > 0) {
    warnings.push(
      `${unplaced.length} session(s) could not be auto-placed without violating a clash rule. They were left as "Free / Self Study" - consider increasing teacher/classroom availability.`
    );
  }

  return { placed, unplaced, warnings };
}

module.exports = { generateTimetable, buildSessionQueue };
