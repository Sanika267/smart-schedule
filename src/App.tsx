import React, { useState, useEffect, useMemo } from 'react';
import {
  CoordinatorDataFile,
  Division,
  GenerationStats,
  Room,
  SolverConfig,
  Subject,
  Teacher,
  TimetableEntry,
  TimetableNotification,
  DayOfWeek,
} from './types/timetable';
import {
  INITIAL_DIVISIONS,
  INITIAL_ROOMS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
} from './data/mockData';
import { generateTimetableCSP, DEFAULT_SOLVER_CONFIG } from './algorithms/cspSolver';
import { auditTimetable } from './algorithms/clashDetector';
import { checkCoordinatorDataFeasibility } from './algorithms/feasibilityChecker';
import { TimetableGrid } from './components/TimetableGrid';
import { GeneratorControls } from './components/GeneratorControls';
import { ManualEditModal } from './components/ManualEditModal';
import { SubstituteModal } from './components/SubstituteModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { EntityManagementModal } from './components/EntityManagementModal';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';
import { CoordinatorDataModal } from './components/CoordinatorDataModal';
import { CoordinatorStagingBanner } from './components/CoordinatorStagingBanner';
import { LectureDetailModal } from './components/LectureDetailModal';
import {
  Bell,
  Building2,
  Calendar,
  Cpu,
  Download,
  Filter,
  GraduationCap,
  Save,
  Sparkles,
  User,
  Users,
  AlertTriangle,
  Lock,
  Eye,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY_COORDINATOR_DATA = 'college_timetable_coordinator_data_v1';
const STORAGE_KEY_GENERATED_ENTRIES = 'college_timetable_generated_entries_v1';
const STORAGE_KEY_GENERATION_STATS = 'college_timetable_generation_stats_v1';

export default function App() {
  // Coordinator College Meta
  const [collegeName, setCollegeName] = useState<string>('State Engineering & Technology College');
  const [departmentName, setDepartmentName] = useState<string>('Department of Computer Science & Engineering');
  const [academicYear, setAcademicYear] = useState<string>('2026 - 2027 (Odd Semester)');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Core Academic Entities
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [divisions, setDivisions] = useState<Division[]>(INITIAL_DIVISIONS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);

  // Timetable State
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [solverConfig, setSolverConfig] = useState<SolverConfig>(DEFAULT_SOLVER_CONFIG);

  // Filter & Role State
  const [userRole, setUserRole] = useState<'admin' | 'faculty' | 'student'>('admin');
  const [viewType, setViewType] = useState<'division' | 'teacher' | 'room'>('division');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | 'all'>('div-cs3a');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | 'all'>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string | 'all'>('all');

  // Modals & Drawers
  const [coordinatorModalOpen, setCoordinatorModalOpen] = useState<boolean>(false);
  const [architectureOpen, setArchitectureOpen] = useState<boolean>(false);
  const [entityModalOpen, setEntityModalOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [substituteEntry, setSubstituteEntry] = useState<TimetableEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<TimetableEntry | null>(null);

  // Role Switcher Handler with Smart Defaults
  const handleRoleChange = (role: 'admin' | 'faculty' | 'student') => {
    setUserRole(role);
    if (role === 'student') {
      setViewType('division');
      if (divisions.length > 0 && selectedDivisionId === 'all') {
        setSelectedDivisionId(divisions[0].id);
      }
    } else if (role === 'faculty') {
      setViewType('teacher');
      if (teachers.length > 0 && selectedTeacherId === 'all') {
        setSelectedTeacherId(teachers[0].id);
      }
    }
  };

  // Notifications State
  const [notifications, setNotifications] = useState<TimetableNotification[]>([
    {
      id: 'notif-init',
      timestamp: 'Ready',
      type: 'full_generation',
      title: 'Coordinator Workspace Ready',
      message: 'Configure subjects, teachers, classrooms, practical labs, and divisions, then save to data file and generate.',
      targetRole: 'all',
      read: false,
    },
  ]);

  // Load Coordinator Data & Previously Generated Timetable from localStorage on mount
  useEffect(() => {
    let currentDivs = INITIAL_DIVISIONS;
    let currentSubs = INITIAL_SUBJECTS;
    let currentTeachers = INITIAL_TEACHERS;
    let currentRooms = INITIAL_ROOMS;

    try {
      const savedCoordinator = localStorage.getItem(STORAGE_KEY_COORDINATOR_DATA);
      if (savedCoordinator) {
        const parsed: CoordinatorDataFile = JSON.parse(savedCoordinator);
        if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
          currentSubs = parsed.subjects;
          setSubjects(parsed.subjects);
        }
        if (Array.isArray(parsed.teachers) && parsed.teachers.length > 0) {
          // Safeguard against legacy low capacity values in local storage
          const sanitizedTeachers = parsed.teachers.map((t) => {
            const initial = INITIAL_TEACHERS.find((it) => it.id === t.id);
            if (initial && (!t.maxWeeklyHours || t.maxWeeklyHours < initial.maxWeeklyHours)) {
              return { ...t, maxWeeklyHours: initial.maxWeeklyHours };
            }
            return t;
          });
          currentTeachers = sanitizedTeachers;
          setTeachers(sanitizedTeachers);
        }
        if (Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
          currentRooms = parsed.rooms;
          setRooms(parsed.rooms);
        }
        if (Array.isArray(parsed.divisions) && parsed.divisions.length > 0) {
          // Safeguard against any duplicate division IDs in saved storage
          const seenDivIds = new Set<string>();
          const sanitizedDivs = parsed.divisions.map((d, index) => {
            let id = d.id;
            if (!id || seenDivIds.has(id)) {
              id = `${d.id || 'div'}-${index + 1}`;
            }
            seenDivIds.add(id);
            return { ...d, id };
          });
          currentDivs = sanitizedDivs;
          setDivisions(sanitizedDivs);
        }
        if (parsed.collegeName) setCollegeName(parsed.collegeName);
        if (parsed.department) setDepartmentName(parsed.department);
        if (parsed.academicYear) setAcademicYear(parsed.academicYear);
        if (parsed.lastSavedAt) setLastSavedAt(parsed.lastSavedAt);
        if (parsed.solverConfig) setSolverConfig(parsed.solverConfig);
      }

      const savedEntries = localStorage.getItem(STORAGE_KEY_GENERATED_ENTRIES);
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        if (Array.isArray(parsedEntries) && parsedEntries.length > 0) {
          setEntries(parsedEntries);
          const savedStats = localStorage.getItem(STORAGE_KEY_GENERATION_STATS);
          if (savedStats) {
            setStats(JSON.parse(savedStats));
          }
          return;
        }
      }

      // Auto-generate initial timetable if none cached or cache was empty
      const initialGen = generateTimetableCSP(currentDivs, currentSubs, currentTeachers, currentRooms);
      if (initialGen.entries.length > 0) {
        setEntries(initialGen.entries);
        setStats(initialGen.stats);
        try {
          localStorage.setItem(STORAGE_KEY_GENERATED_ENTRIES, JSON.stringify(initialGen.entries));
          localStorage.setItem(STORAGE_KEY_GENERATION_STATS, JSON.stringify(initialGen.stats));
        } catch (_) {
          // Ignore cache errors
        }
      }
    } catch (e) {
      console.warn('Could not restore cached timetable data from localStorage:', e);
    }
  }, []);

  // Feasibility Check
  const feasibility = useMemo(() => {
    return checkCoordinatorDataFeasibility(divisions, subjects, teachers, rooms);
  }, [divisions, subjects, teachers, rooms]);

  // Add Notification Helper
  const addNotification = (notif: Omit<TimetableNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: TimetableNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Save current academic factors into persistent data file
  // Persist coordinator inputs to data file (Admin only)
  const handleSaveToDataFile = () => {
    if (userRole !== 'admin') return;

    const formattedDate =
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString();

    const dataFile: CoordinatorDataFile = {
      collegeName,
      department: departmentName,
      academicYear,
      lastSavedAt: formattedDate,
      version: '1.0.0',
      subjects,
      teachers,
      rooms,
      divisions,
      solverConfig,
    };

    localStorage.setItem(STORAGE_KEY_COORDINATOR_DATA, JSON.stringify(dataFile));
    setLastSavedAt(formattedDate);

    addNotification({
      type: 'full_generation',
      title: 'Coordinator Data File Saved',
      message: `Saved configuration with ${subjects.length} subjects, ${teachers.length} faculty, ${rooms.length} rooms/labs, and ${divisions.length} divisions.`,
      targetRole: 'all',
    });
  };

  // Download Data File as JSON
  const handleDownloadDataFile = () => {
    const dataFile: CoordinatorDataFile = {
      collegeName,
      department: departmentName,
      academicYear,
      lastSavedAt: new Date().toISOString(),
      version: '1.0.0',
      subjects,
      teachers,
      rooms,
      divisions,
      solverConfig,
    };

    const blob = new Blob([JSON.stringify(dataFile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college_timetable_data_${collegeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run CSP Solver on user request with coordinator factors (Admin only)
  const runSolver = () => {
    if (userRole !== 'admin') return;

    if (!feasibility.isFeasible) {
      setCoordinatorModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const result = generateTimetableCSP(divisions, subjects, teachers, rooms, solverConfig);
      setEntries(result.entries);
      setStats(result.stats);
      setIsGenerating(false);

      // Persist generated timetable
      try {
        localStorage.setItem(STORAGE_KEY_GENERATED_ENTRIES, JSON.stringify(result.entries));
        localStorage.setItem(STORAGE_KEY_GENERATION_STATS, JSON.stringify(result.stats));
      } catch (err) {
        console.warn('Failed to cache generated entries in localStorage', err);
      }

      // Ensure active division filter points to a valid division
      if (selectedDivisionId !== 'all' && !divisions.some((d) => d.id === selectedDivisionId)) {
        setSelectedDivisionId(divisions[0]?.id || 'all');
      }

      if (result.entries.length === 0) {
        addNotification({
          type: 'full_generation',
          title: 'Timetable Generation Stalled',
          message: 'Could not schedule sessions. Please check room availability and faculty workload limits in the Feasibility tab.',
          targetRole: 'all',
        });
        setCoordinatorModalOpen(true);
      } else if (result.stats.hardConstraintsMet) {
        addNotification({
          type: 'full_generation',
          title: 'Timetable Generated from Coordinator Data',
          message: `Successfully generated ${result.entries.length} sessions across ${divisions.length} divisions with 0 clashes (${result.stats.durationMs}ms).`,
          targetRole: 'all',
        });
      } else {
        addNotification({
          type: 'full_generation',
          title: 'Timetable Generated (With Adjustments)',
          message: `Generated ${result.entries.length} sessions. Some sessions required flexible faculty workload.`,
          targetRole: 'all',
        });
      }
    }, 150);
  };

  // Coordinator updates entities through modal (Admin only)
  const handleUpdateEntities = (
    newSubs: Subject[],
    newTeachers: Teacher[],
    newRooms: Room[],
    newDivs: Division[],
    meta?: { collegeName?: string; department?: string; academicYear?: string }
  ) => {
    if (userRole !== 'admin') return;

    setSubjects(newSubs);
    setTeachers(newTeachers);
    setRooms(newRooms);
    setDivisions(newDivs);

    if (meta?.collegeName) setCollegeName(meta.collegeName);
    if (meta?.department) setDepartmentName(meta.department);
    if (meta?.academicYear) setAcademicYear(meta.academicYear);

    // Auto-save to data file on entity updates
    const formattedDate =
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString();
    setLastSavedAt(formattedDate);

    const updatedDataFile: CoordinatorDataFile = {
      collegeName: meta?.collegeName || collegeName,
      department: meta?.department || departmentName,
      academicYear: meta?.academicYear || academicYear,
      lastSavedAt: formattedDate,
      version: '1.0.0',
      subjects: newSubs,
      teachers: newTeachers,
      rooms: newRooms,
      divisions: newDivs,
      solverConfig,
    };
    localStorage.setItem(STORAGE_KEY_COORDINATOR_DATA, JSON.stringify(updatedDataFile));

    // Update active division if deleted
    if (selectedDivisionId !== 'all' && !newDivs.some((d) => d.id === selectedDivisionId)) {
      setSelectedDivisionId(newDivs[0]?.id || 'all');
    }
  };

  // Toggle teacher availability / leave (Admin only)
  const handleToggleTeacherAvailability = (teacherId: string) => {
    if (userRole !== 'admin') return;

    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === teacherId) {
          const nextStatus = t.isAvailable === false;
          addNotification({
            type: 'substitution',
            title: 'Faculty Leave Status Updated',
            message: `${t.name} is now marked as ${nextStatus ? 'Available' : 'On Leave'}.`,
            targetRole: 'faculty',
            affectedTeacherId: t.id,
          });
          return { ...t, isAvailable: nextStatus };
        }
        return t;
      })
    );
  };

  // Manual Edit Commit (Admin only)
  const handleSaveEntry = (updated: TimetableEntry) => {
    if (userRole !== 'admin') return;

    setEntries((prev) => {
      const next = prev.map((e) => (e.id === updated.id ? updated : e));
      localStorage.setItem(STORAGE_KEY_GENERATED_ENTRIES, JSON.stringify(next));
      return next;
    });

    const sub = subjects.find((s) => s.id === updated.subjectId);
    const div = divisions.find((d) => d.id === updated.divisionId);

    addNotification({
      type: 'time_change',
      title: 'Lecture Relocated',
      message: `${sub?.code} for ${div?.name} moved to ${updated.day} (Slot ${updated.slotIndex + 1}).`,
      targetRole: 'all',
      affectedDivisionId: updated.divisionId,
      affectedTeacherId: updated.teacherId,
    });
  };

  // Delete Lecture (Admin only)
  const handleDeleteEntry = (entryId: string) => {
    if (userRole !== 'admin') return;

    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== entryId);
      localStorage.setItem(STORAGE_KEY_GENERATED_ENTRIES, JSON.stringify(next));
      return next;
    });
  };

  // Create slot from empty click
  const handleEmptySlotClick = (day: DayOfWeek, slotIndex: number) => {
    if (userRole !== 'admin') return;

    const targetDiv =
      selectedDivisionId !== 'all'
        ? divisions.find((d) => d.id === selectedDivisionId) || divisions[0]
        : divisions[0];
    const targetSub = subjects.find((s) => targetDiv?.subjectIds.includes(s.id)) || subjects[0];
    const targetTeacher =
      teachers.find((t) => t.qualifiedSubjectIds.includes(targetSub?.id || '')) || teachers[0];
    const targetRoom = rooms[0];

    if (!targetDiv || !targetSub || !targetTeacher || !targetRoom) {
      setCoordinatorModalOpen(true);
      return;
    }

    const newEntry: TimetableEntry = {
      id: `tt_manual_${Date.now()}`,
      divisionId: targetDiv.id,
      subjectId: targetSub.id,
      teacherId: targetTeacher.id,
      roomId: targetRoom.id,
      day,
      slotIndex,
      durationSlots: 1,
      isPractical: false,
    };

    setEditingEntry(newEntry);
  };

  // Assign Substitute (Admin only)
  const handleAssignSubstitute = (
    entryId: string,
    substituteTeacherId: string,
    reason: string
  ) => {
    if (userRole !== 'admin') return;

    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const originalTeacherId = entry.originalTeacherId || entry.teacherId;
    const substituteTeacher = teachers.find((t) => t.id === substituteTeacherId);
    const originalTeacher = teachers.find((t) => t.id === originalTeacherId);
    const subject = subjects.find((s) => s.id === entry.subjectId);
    const division = divisions.find((d) => d.id === entry.divisionId);

    setEntries((prev) => {
      const next = prev.map((e) => {
        if (e.id === entryId) {
          return {
            ...e,
            teacherId: substituteTeacherId,
            originalTeacherId,
            isSubstituted: true,
            substitutionReason: reason,
          };
        }
        return e;
      });
      localStorage.setItem(STORAGE_KEY_GENERATED_ENTRIES, JSON.stringify(next));
      return next;
    });

    addNotification({
      type: 'substitution',
      title: 'Substitute Faculty Assigned',
      message: `${substituteTeacher?.name} will substitute for ${originalTeacher?.name} in ${subject?.code} (${division?.name}) on ${entry.day}.`,
      targetRole: 'all',
      affectedDivisionId: entry.divisionId,
      affectedTeacherId: substituteTeacherId,
    });
  };

  // Revert Substitute (Admin only)
  const handleRevertSubstitute = (entryId: string) => {
    if (userRole !== 'admin') return;

    setEntries((prev) => {
      const next = prev.map((e) => {
        if (e.id === entryId && e.originalTeacherId) {
          return {
            ...e,
            teacherId: e.originalTeacherId,
            originalTeacherId: undefined,
            isSubstituted: false,
            substitutionReason: undefined,
          };
        }
        return e;
      });
      localStorage.setItem(STORAGE_KEY_GENERATED_ENTRIES, JSON.stringify(next));
      return next;
    });
  };

  // Full timetable clash audit
  const overallClashes = useMemo(() => {
    return auditTimetable(entries, teachers, rooms, subjects, divisions);
  }, [entries, teachers, rooms, subjects, divisions]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  College Timetable Management System
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-200">
                  Coordinator Hub &amp; CSP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md sm:max-w-xl">
                {collegeName} • {departmentName}
              </p>
            </div>
          </div>

          {/* Action Buttons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coordinator Inputs Button - ADMIN ONLY */}
            {userRole === 'admin' && (
              <button
                id="open-coordinator-data-btn"
                onClick={() => setCoordinatorModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Configure subjects, faculty, classrooms, labs, and divisions"
              >
                <Users className="w-4 h-4" />
                <span>Coordinator Data</span>
                <span className="hidden sm:inline px-1.5 py-0.5 bg-blue-500/80 rounded text-[10px]">
                  {divisions.length} Divs
                </span>
              </button>
            )}

            {/* Quick Save to Data File - ADMIN ONLY */}
            {userRole === 'admin' && (
              <button
                id="quick-save-data-file-btn"
                onClick={handleSaveToDataFile}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Save current inputs to data file"
              >
                <Save className="w-3.5 h-3.5 text-emerald-600" />
                <span>Save File</span>
              </button>
            )}

            {/* Read-Only Badge for Faculty / Student */}
            {userRole !== 'admin' && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{userRole === 'faculty' ? 'Faculty Portal' : 'Student Portal'} (Read-Only)</span>
              </div>
            )}

            {/* System Architecture Specifications */}
            <button
              id="open-architecture-specs-btn"
              onClick={() => setArchitectureOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Specs</span>
            </button>

            {/* Notification Bell */}
            <button
              id="open-notifications-btn"
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => handleRoleChange('admin')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  userRole === 'admin' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => handleRoleChange('faculty')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  userRole === 'faculty' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faculty
              </button>
              <button
                onClick={() => handleRoleChange('student')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  userRole === 'student' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1 w-full">
        {/* Role Portal Context Notice for Non-Admin */}
        {userRole !== 'admin' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  userRole === 'faculty' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                }`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {userRole === 'faculty' ? 'Faculty Portal: View Schedule' : 'Student Portal: Class Timetable'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Read-Only
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  {userRole === 'faculty'
                    ? 'View your teaching routine and assigned lab sessions. Only the Timetable Coordinator has permissions to generate or modify the timetable.'
                    : 'Select your class/division below to view your timetable. Timetable modifications are restricted to Admin.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Schedule</span>
              </button>
            </div>
          </div>
        )}

        {/* Clash Alert Banner */}
        {overallClashes.length > 0 && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-900">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Schedule Conflict Alert: {overallClashes.length} clash(es) detected in active schedule.
              </span>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={runSolver}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Auto-Resolve with CSP
              </button>
            )}
          </div>
        )}

        {/* Coordinator Factors & Staging Banner */}
        <CoordinatorStagingBanner
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          divisions={divisions}
          hasGenerated={entries.length > 0}
          userRole={userRole}
          onOpenCoordinatorHub={() => {
            if (userRole === 'admin') setCoordinatorModalOpen(true);
          }}
          onGenerateTimetable={runSolver}
          onSaveToDataFile={handleSaveToDataFile}
          onDownloadDataFile={handleDownloadDataFile}
          lastSavedAt={lastSavedAt}
          feasibility={feasibility}
          collegeName={collegeName}
          department={departmentName}
        />

        {/* Generator Controls (Admin view only) */}
        {userRole === 'admin' && (
          <GeneratorControls
            isGenerating={isGenerating}
            stats={stats}
            config={solverConfig}
            onConfigChange={setSolverConfig}
            onGenerate={runSolver}
            onResetToDefault={runSolver}
            onPrint={() => window.print()}
            onOpenCoordinatorHub={() => setCoordinatorModalOpen(true)}
            onSaveToDataFile={handleSaveToDataFile}
            lastSavedAt={lastSavedAt}
            hasGenerated={entries.length > 0}
            feasibility={feasibility}
            entityCounts={{
              subjects: subjects.length,
              teachers: teachers.length,
              rooms: rooms.length,
              divisions: divisions.length,
            }}
          />
        )}

        {/* View Selection & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* View Perspective Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400 mr-1 flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold">
              <Filter className="w-3.5 h-3.5" /> View by:
            </span>
            <button
              onClick={() => {
                setViewType('division');
                if (divisions.length > 0 && selectedDivisionId === 'all') {
                  setSelectedDivisionId(divisions[0].id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewType === 'division'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Class / Division
            </button>
            <button
              onClick={() => {
                setViewType('teacher');
                if (teachers.length > 0 && selectedTeacherId === 'all') {
                  setSelectedTeacherId(teachers[0].id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewType === 'teacher'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Faculty Individual Schedule
            </button>
            <button
              onClick={() => {
                setViewType('room');
                if (rooms.length > 0 && selectedRoomId === 'all') {
                  setSelectedRoomId(rooms[0].id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewType === 'room'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Classroom &amp; Lab Utilization
            </button>
          </div>

          {/* Secondary Dropdown Filter */}
          <div className="flex items-center gap-2 text-xs">
            {viewType === 'division' && (
              <select
                id="select-division-filter"
                value={selectedDivisionId}
                onChange={(e) => setSelectedDivisionId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Divisions (Master Overview)</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            )}

            {viewType === 'teacher' && (
              <select
                id="select-teacher-filter"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Faculty</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
            )}

            {viewType === 'room' && (
              <select
                id="select-room-filter"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Rooms &amp; Labs</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type === 'lab' ? 'Lab' : 'Classroom'})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Timetable Interactive Grid */}
        <TimetableGrid
          entries={entries}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          divisions={divisions}
          selectedDivisionId={selectedDivisionId}
          selectedTeacherId={selectedTeacherId}
          selectedRoomId={selectedRoomId}
          userRole={userRole}
          onSelectEntry={(entry) => {
            if (userRole === 'admin') {
              setEditingEntry(entry);
            } else {
              setDetailEntry(entry);
            }
          }}
          onFindSubstitute={(entry) => {
            if (userRole === 'admin') {
              setSubstituteEntry(entry);
            }
          }}
          onEmptySlotClick={handleEmptySlotClick}
          onGenerateTimetable={userRole === 'admin' ? runSolver : undefined}
          onOpenCoordinatorHub={userRole === 'admin' ? () => setCoordinatorModalOpen(true) : undefined}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <p>
            Academic Timetable Engine • Coordinator Data File • Constraint Satisfaction Problem (CSP)
          </p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Hard Constraints: 100% Guaranteed</span>
            <span>•</span>
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setCoordinatorModalOpen(true)}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Coordinator Data File
                </button>
                <span>•</span>
              </>
            )}
            <button
              onClick={() => setArchitectureOpen(true)}
              className="text-slate-600 hover:underline font-semibold cursor-pointer"
            >
              System Specs
            </button>
          </div>
        </div>
      </footer>

      {/* Lecture Detail Modal (Read-only for Faculty/Students, edit path for Admin) */}
      <LectureDetailModal
        isOpen={!!detailEntry}
        entry={detailEntry}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
        divisions={divisions}
        userRole={userRole}
        onClose={() => setDetailEntry(null)}
        onAdminEdit={(entry) => {
          if (userRole === 'admin') {
            setEditingEntry(entry);
          }
        }}
      />

      {/* Coordinator Data & Factors Modal (Admin Only) */}
      {userRole === 'admin' && (
        <CoordinatorDataModal
          isOpen={coordinatorModalOpen}
          onClose={() => setCoordinatorModalOpen(false)}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          divisions={divisions}
          collegeName={collegeName}
          department={departmentName}
          academicYear={academicYear}
          solverConfig={solverConfig}
          onUpdateEntities={handleUpdateEntities}
          onGenerateTimetable={() => {
            setCoordinatorModalOpen(false);
            runSolver();
          }}
          isGenerating={isGenerating}
        />
      )}

      {/* System Architecture Specifications */}
      <SystemArchitectureModal
        isOpen={architectureOpen}
        onClose={() => setArchitectureOpen(false)}
      />

      {/* Quick Entities Availability Modal (Admin Only) */}
      {userRole === 'admin' && (
        <EntityManagementModal
          isOpen={entityModalOpen}
          teachers={teachers}
          subjects={subjects}
          divisions={divisions}
          rooms={rooms}
          onClose={() => setEntityModalOpen(false)}
          onToggleTeacherAvailability={handleToggleTeacherAvailability}
        />
      )}

      {/* Manual Slot Edit Modal (Admin Only) */}
      {userRole === 'admin' && (
        <ManualEditModal
          isOpen={!!editingEntry}
          entry={editingEntry}
          allEntries={entries}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          divisions={divisions}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
        />
      )}

      {/* Substitute Teacher Assignment Modal (Admin Only) */}
      {userRole === 'admin' && (
        <SubstituteModal
          isOpen={!!substituteEntry}
          entry={substituteEntry}
          allEntries={entries}
          teachers={teachers}
          subjects={subjects}
          divisions={divisions}
          rooms={rooms}
          onClose={() => setSubstituteEntry(null)}
          onAssignSubstitute={handleAssignSubstitute}
          onRevertSubstitute={handleRevertSubstitute}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
      />
    </div>
  );
}
