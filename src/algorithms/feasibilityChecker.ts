import { Division, FeasibilityIssue, FeasibilityReport, Room, Subject, Teacher } from '../types/timetable';
import { STANDARD_PERIODS } from '../data/mockData';

/**
 * Validates the coordinator's academic dataset before running the CSP solver.
 * Verifies that:
 * 1. At least one division exists.
 * 2. Every subject assigned to a division exists and has at least one active, qualified teacher.
 * 3. Lab rooms exist for all subjects with practical hours or requiring labs.
 * 4. Classrooms exist for subjects with theory hours.
 * 5. Weekly hour limits are within physical boundaries (max 35 slots/week per division).
 * 6. Total faculty teaching capacity is sufficient for the curriculum.
 */
export function checkCoordinatorDataFeasibility(
  divisions: Division[],
  subjects: Subject[],
  teachers: Teacher[],
  rooms: Room[]
): FeasibilityReport {
  const errors: FeasibilityIssue[] = [];
  const warnings: FeasibilityIssue[] = [];

  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));
  const classrooms = rooms.filter((r) => r.type === 'classroom');
  const labs = rooms.filter((r) => r.type === 'lab');

  let totalWeeklyHoursRequired = 0;
  let theorySlotsNeeded = 0;
  let practicalSlotsNeeded = 0;

  // 1. Division Checks
  if (divisions.length === 0) {
    errors.push({
      type: 'error',
      category: 'divisions',
      title: 'No Divisions Configured',
      description: 'Please add at least one student division (e.g., Year 3 Div A) to generate a timetable.',
      actionTab: 'divisions',
    });
  }

  // 2. Room & Lab Checks
  if (classrooms.length === 0) {
    errors.push({
      type: 'error',
      category: 'rooms',
      title: 'No Theory Classrooms Available',
      description: 'At least one Room of type "Classroom" is required to host theory lectures.',
      actionTab: 'rooms',
    });
  }

  const anyPracticalNeeded = subjects.some((s) => s.practicalHoursPerWeek > 0 || s.isLabRequired);
  if (anyPracticalNeeded && labs.length === 0) {
    errors.push({
      type: 'error',
      category: 'labs',
      title: 'No Practical Labs Available',
      description: 'One or more subjects require practical lab sessions, but no Rooms of type "Lab" are defined.',
      actionTab: 'rooms',
    });
  }

  // 3. Subject & Teacher Qualifications Check
  const assignedSubjectIds = new Set<string>();
  divisions.forEach((div) => {
    let divWeeklyHours = 0;

    if (!div.subjectIds || div.subjectIds.length === 0) {
      warnings.push({
        type: 'warning',
        category: 'divisions',
        title: `Division "${div.name}" Has No Subjects`,
        description: 'No curriculum subjects are assigned to this division. Please select subjects.',
        actionTab: 'divisions',
      });
      return;
    }

    div.subjectIds.forEach((subId) => {
      assignedSubjectIds.add(subId);
      const sub = subjectsMap.get(subId);
      if (!sub) {
        errors.push({
          type: 'error',
          category: 'subjects',
          title: `Unknown Subject ID "${subId}" in Division "${div.name}"`,
          description: 'The assigned subject does not exist in the curriculum subjects catalog.',
          actionTab: 'subjects',
        });
        return;
      }

      const theoryHrs = sub.theoryHoursPerWeek || 0;
      const practicalHrs = sub.practicalHoursPerWeek || 0;
      divWeeklyHours += theoryHrs + practicalHrs;
      totalWeeklyHoursRequired += theoryHrs + practicalHrs;
      theorySlotsNeeded += theoryHrs;
      practicalSlotsNeeded += practicalHrs;

      // Check if subject has at least one active qualified teacher
      const qualifiedTeachers = teachers.filter(
        (t) => t.qualifiedSubjectIds?.includes(sub.id) && t.isAvailable !== false
      );

      if (qualifiedTeachers.length === 0) {
        const anyTeacherRegardlessAvailability = teachers.filter((t) =>
          t.qualifiedSubjectIds?.includes(sub.id)
        );

        if (anyTeacherRegardlessAvailability.length === 0) {
          errors.push({
            type: 'error',
            category: 'teachers',
            title: `No Teacher for Subject "${sub.code} - ${sub.name}"`,
            description: `Division "${div.name}" requires ${sub.code}, but no faculty member is qualified to teach it. Please assign this subject to a teacher.`,
            actionTab: 'teachers',
          });
        } else {
          errors.push({
            type: 'error',
            category: 'teachers',
            title: `All Faculty for "${sub.code}" Are On Leave`,
            description: `Faculty qualified for ${sub.code} are currently marked as on leave. Please mark at least one teacher as available or assign an alternative.`,
            actionTab: 'teachers',
          });
        }
      }
    });

    // Teaching periods dynamically determined by STANDARD_PERIODS (excluding lunch break)
    const teachingSlotsPerDay = STANDARD_PERIODS.filter((p) => !p.isBreak).length;
    const maxWeeklySlots = teachingSlotsPerDay * 5;

    if (divWeeklyHours > maxWeeklySlots) {
      errors.push({
        type: 'error',
        category: 'divisions',
        title: `Excessive Weekly Hours for "${div.name}"`,
        description: `This division requires ${divWeeklyHours} hrs/week, but a 5-day academic week only has ${maxWeeklySlots} available periods (${teachingSlotsPerDay} periods/day).`,
        actionTab: 'divisions',
      });
    } else if (divWeeklyHours > Math.floor(maxWeeklySlots * 0.88)) {
      warnings.push({
        type: 'warning',
        category: 'divisions',
        title: `High Workload for "${div.name}"`,
        description: `This division requires ${divWeeklyHours} hrs/week, leaving very few open slots. Scheduling may be tight.`,
        actionTab: 'divisions',
      });
    }
  });

  // 4. Overall & Subject-Level Faculty Capacity Check
  const activeTeachers = teachers.filter((t) => t.isAvailable !== false);
  const totalTeacherCapacityHours = activeTeachers.reduce(
    (sum, t) => sum + (t.maxWeeklyHours || 16),
    0
  );

  // Check subject-level teaching capacity across divisions
  const subjectTotalHours = new Map<string, number>();
  divisions.forEach((div) => {
    div.subjectIds?.forEach((subId) => {
      const sub = subjectsMap.get(subId);
      if (sub) {
        const hrs = (sub.theoryHoursPerWeek || 0) + (sub.practicalHoursPerWeek || 0);
        subjectTotalHours.set(subId, (subjectTotalHours.get(subId) || 0) + hrs);
      }
    });
  });

  subjectTotalHours.forEach((neededHrs, subId) => {
    const sub = subjectsMap.get(subId);
    if (!sub) return;
    const qualifiedActive = teachers.filter(
      (t) => t.qualifiedSubjectIds?.includes(subId) && t.isAvailable !== false
    );
    const totalCap = qualifiedActive.reduce((sum, t) => sum + (t.maxWeeklyHours || 16), 0);
    if (totalCap < neededHrs) {
      errors.push({
        type: 'error',
        category: 'teachers',
        title: `Faculty Capacity Insufficient for "${sub.code} - ${sub.name}"`,
        description: `Curriculum requires ${neededHrs} hrs/week of ${sub.code} across divisions, but qualified faculty only have ${totalCap} hrs/week combined capacity. Increase faculty max weekly hours or qualify more teachers.`,
        actionTab: 'teachers',
      });
    }
  });

  if (activeTeachers.length === 0) {
    errors.push({
      type: 'error',
      category: 'teachers',
      title: 'No Active Faculty Available',
      description: 'Please add active faculty members or mark existing faculty as available.',
      actionTab: 'teachers',
    });
  } else if (totalTeacherCapacityHours < totalWeeklyHoursRequired) {
    warnings.push({
      type: 'warning',
      category: 'teachers',
      title: 'Faculty Teaching Capacity Tight',
      description: `Required weekly teaching hours (${totalWeeklyHoursRequired} hrs) exceed total faculty workload limits (${totalTeacherCapacityHours} hrs). Teachers may exceed max hours.`,
      actionTab: 'teachers',
    });
  }

  // 5. Unassigned Subjects warning
  subjects.forEach((sub) => {
    if (!assignedSubjectIds.has(sub.id)) {
      warnings.push({
        type: 'warning',
        category: 'subjects',
        title: `Subject "${sub.code} - ${sub.name}" Not In Any Division`,
        description: 'This subject exists in the catalog but is not assigned to any division curriculum.',
        actionTab: 'divisions',
      });
    }
  });

  return {
    isFeasible: errors.length === 0,
    errors,
    warnings,
    totalWeeklyHoursRequired,
    totalTeacherCapacityHours,
    theoryRoomsAvailable: classrooms.length,
    labRoomsAvailable: labs.length,
    theorySlotsNeeded,
    practicalSlotsNeeded,
  };
}
