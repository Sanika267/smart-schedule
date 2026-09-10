import React, { useState, useRef } from 'react';
import {
  CoordinatorDataFile,
  DayOfWeek,
  DAYS_OF_WEEK,
  Division,
  FeasibilityReport,
  Room,
  RoomType,
  Subject,
  Teacher,
} from '../types/timetable';
import { checkCoordinatorDataFeasibility } from '../algorithms/feasibilityChecker';
import { INITIAL_DIVISIONS, INITIAL_ROOMS, INITIAL_SUBJECTS, INITIAL_TEACHERS } from '../data/mockData';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileCode,
  FileDown,
  FileUp,
  FlaskConical,
  GraduationCap,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  divisions: Division[];
  collegeName: string;
  department: string;
  academicYear: string;
  onUpdateEntities: (data: {
    subjects: Subject[];
    teachers: Teacher[];
    rooms: Room[];
    divisions: Division[];
    collegeName?: string;
    department?: string;
    academicYear?: string;
  }) => void;
  onSaveToDataFile: () => void;
  onGenerateTimetable: () => void;
  lastSavedAt: string | null;
}

const SUBJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
];

export const CoordinatorDataModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subjects,
  teachers,
  rooms,
  divisions,
  collegeName,
  department,
  academicYear,
  onUpdateEntities,
  onSaveToDataFile,
  onGenerateTimetable,
  lastSavedAt,
}) => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'teachers' | 'rooms' | 'divisions' | 'dataFile'>('subjects');

  // Metadata form
  const [metaCollege, setMetaCollege] = useState(collegeName);
  const [metaDept, setMetaDept] = useState(department);
  const [metaYear, setMetaYear] = useState(academicYear);

  // Editing state for Subject
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subFormCode, setSubFormCode] = useState('');
  const [subFormName, setSubFormName] = useState('');
  const [subFormTheoryHours, setSubFormTheoryHours] = useState(3);
  const [subFormPracticalHours, setSubFormPracticalHours] = useState(2);
  const [subFormIsLab, setSubFormIsLab] = useState(true);
  const [subFormColor, setSubFormColor] = useState('#3B82F6');

  // Editing state for Teacher
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [teachFormName, setTeachFormName] = useState('');
  const [teachFormEmail, setTeachFormEmail] = useState('');
  const [teachFormDept, setTeachFormDept] = useState(department);
  const [teachFormMaxHours, setTeachFormMaxHours] = useState(16);
  const [teachFormAvailable, setTeachFormAvailable] = useState(true);
  const [teachFormSubjects, setTeachFormSubjects] = useState<string[]>([]);
  const [teachFormDays, setTeachFormDays] = useState<DayOfWeek[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  // Editing state for Room
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [roomFormName, setRoomFormName] = useState('');
  const [roomFormType, setRoomFormType] = useState<RoomType>('classroom');
  const [roomFormCapacity, setRoomFormCapacity] = useState(60);
  const [roomFormBuilding, setRoomFormBuilding] = useState('Academic Block');

  // Editing state for Division
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [isAddingDivision, setIsAddingDivision] = useState(false);
  const [divFormName, setDivFormName] = useState('');
  const [divFormDept, setDivFormDept] = useState(department);
  const [divFormSemester, setDivFormSemester] = useState(5);
  const [divFormStudentCount, setDivFormStudentCount] = useState(60);
  const [divFormDefaultRoom, setDivFormDefaultRoom] = useState('');
  const [divFormSubjects, setDivFormSubjects] = useState<string[]>([]);

  // File import state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Live feasibility report
  const feasibility: FeasibilityReport = checkCoordinatorDataFeasibility(
    divisions,
    subjects,
    teachers,
    rooms
  );

  if (!isOpen) return null;

  // --- Subject Handlers ---
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubFormCode('');
    setSubFormName('');
    setSubFormTheoryHours(3);
    setSubFormPracticalHours(2);
    setSubFormIsLab(true);
    setSubFormColor(SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]);
    setIsAddingSubject(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubFormCode(sub.code);
    setSubFormName(sub.name);
    setSubFormTheoryHours(sub.theoryHoursPerWeek);
    setSubFormPracticalHours(sub.practicalHoursPerWeek);
    setSubFormIsLab(sub.isLabRequired);
    setSubFormColor(sub.color);
    setIsAddingSubject(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormCode.trim() || !subFormName.trim()) return;

    if (editingSubject) {
      const updated = subjects.map((s) =>
        s.id === editingSubject.id
          ? {
              ...s,
              code: subFormCode.trim().toUpperCase(),
              name: subFormName.trim(),
              theoryHoursPerWeek: Number(subFormTheoryHours),
              practicalHoursPerWeek: Number(subFormPracticalHours),
              isLabRequired: subFormIsLab,
              color: subFormColor,
            }
          : s
      );
      onUpdateEntities({ subjects: updated, teachers, rooms, divisions });
    } else {
      const newSub: Subject = {
        id: `sub-${Date.now()}`,
        code: subFormCode.trim().toUpperCase(),
        name: subFormName.trim(),
        theoryHoursPerWeek: Number(subFormTheoryHours),
        practicalHoursPerWeek: Number(subFormPracticalHours),
        isLabRequired: subFormIsLab,
        color: subFormColor,
      };
      onUpdateEntities({ subjects: [...subjects, newSub], teachers, rooms, divisions });
    }
    setIsAddingSubject(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (id: string) => {
    if (!confirm('Are you sure you want to delete this subject? It will be removed from teachers and divisions.')) return;
    const updatedSubjects = subjects.filter((s) => s.id !== id);
    const updatedTeachers = teachers.map((t) => ({
      ...t,
      qualifiedSubjectIds: t.qualifiedSubjectIds.filter((sid) => sid !== id),
    }));
    const updatedDivisions = divisions.map((d) => ({
      ...d,
      subjectIds: d.subjectIds.filter((sid) => sid !== id),
    }));
    onUpdateEntities({
      subjects: updatedSubjects,
      teachers: updatedTeachers,
      rooms,
      divisions: updatedDivisions,
    });
  };

  // --- Teacher Handlers ---
  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setTeachFormName('');
    setTeachFormEmail('');
    setTeachFormDept(department);
    setTeachFormMaxHours(16);
    setTeachFormAvailable(true);
    setTeachFormSubjects(subjects.length > 0 ? [subjects[0].id] : []);
    setTeachFormDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setIsAddingTeacher(true);
  };

  const handleOpenEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTeachFormName(t.name);
    setTeachFormEmail(t.email);
    setTeachFormDept(t.department);
    setTeachFormMaxHours(t.maxWeeklyHours);
    setTeachFormAvailable(t.isAvailable !== false);
    setTeachFormSubjects(t.qualifiedSubjectIds || []);
    setTeachFormDays(t.preferredDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setIsAddingTeacher(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachFormName.trim()) return;

    if (editingTeacher) {
      const updated = teachers.map((t) =>
        t.id === editingTeacher.id
          ? {
              ...t,
              name: teachFormName.trim(),
              email: teachFormEmail.trim() || `${teachFormName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
              department: teachFormDept.trim(),
              maxWeeklyHours: Number(teachFormMaxHours),
              isAvailable: teachFormAvailable,
              qualifiedSubjectIds: teachFormSubjects,
              preferredDays: teachFormDays,
            }
          : t
      );
      onUpdateEntities({ subjects, teachers: updated, rooms, divisions });
    } else {
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        name: teachFormName.trim(),
        email: teachFormEmail.trim() || `${teachFormName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
        department: teachFormDept.trim(),
        maxWeeklyHours: Number(teachFormMaxHours),
        isAvailable: teachFormAvailable,
        qualifiedSubjectIds: teachFormSubjects,
        preferredDays: teachFormDays,
      };
      onUpdateEntities({ subjects, teachers: [...teachers, newTeacher], rooms, divisions });
    }
    setIsAddingTeacher(false);
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    onUpdateEntities({
      subjects,
      teachers: teachers.filter((t) => t.id !== id),
      rooms,
      divisions,
    });
  };

  // --- Room Handlers ---
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomFormName('');
    setRoomFormType('classroom');
    setRoomFormCapacity(60);
    setRoomFormBuilding('Academic Block');
    setIsAddingRoom(true);
  };

  const handleOpenEditRoom = (r: Room) => {
    setEditingRoom(r);
    setRoomFormName(r.name);
    setRoomFormType(r.type);
    setRoomFormCapacity(r.capacity);
    setRoomFormBuilding(r.building);
    setIsAddingRoom(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormName.trim()) return;

    if (editingRoom) {
      const updated = rooms.map((r) =>
        r.id === editingRoom.id
          ? {
              ...r,
              name: roomFormName.trim(),
              type: roomFormType,
              capacity: Number(roomFormCapacity),
              building: roomFormBuilding.trim(),
            }
          : r
      );
      onUpdateEntities({ subjects, teachers, rooms: updated, divisions });
    } else {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: roomFormName.trim(),
        type: roomFormType,
        capacity: Number(roomFormCapacity),
        building: roomFormBuilding.trim(),
      };
      onUpdateEntities({ subjects, teachers, rooms: [...rooms, newRoom], divisions });
    }
    setIsAddingRoom(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (id: string) => {
    if (!confirm('Are you sure you want to delete this room/lab?')) return;
    onUpdateEntities({
      subjects,
      teachers,
      rooms: rooms.filter((r) => r.id !== id),
      divisions,
    });
  };

  // --- Division Handlers ---
  const handleOpenAddDivision = () => {
    setEditingDivision(null);
    setDivFormName('');
    setDivFormDept(department);
    setDivFormSemester(5);
    setDivFormStudentCount(60);
    setDivFormDefaultRoom(rooms.find((r) => r.type === 'classroom')?.id || rooms[0]?.id || '');
    setDivFormSubjects(subjects.map((s) => s.id));
    setIsAddingDivision(true);
  };

  const handleOpenEditDivision = (d: Division) => {
    setEditingDivision(d);
    setDivFormName(d.name);
    setDivFormDept(d.department);
    setDivFormSemester(d.semester);
    setDivFormStudentCount(d.studentCount);
    setDivFormDefaultRoom(d.defaultClassroomId);
    setDivFormSubjects(d.subjectIds || []);
    setIsAddingDivision(true);
  };

  const handleSaveDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divFormName.trim()) return;

    if (editingDivision) {
      const updated = divisions.map((d) =>
        d.id === editingDivision.id
          ? {
              ...d,
              name: divFormName.trim(),
              department: divFormDept.trim(),
              semester: Number(divFormSemester),
              studentCount: Number(divFormStudentCount),
              defaultClassroomId: divFormDefaultRoom,
              subjectIds: divFormSubjects,
            }
          : d
      );
      onUpdateEntities({ subjects, teachers, rooms, divisions: updated });
    } else {
      const newDiv: Division = {
        id: `div-${Date.now()}`,
        name: divFormName.trim(),
        department: divFormDept.trim(),
        semester: Number(divFormSemester),
        studentCount: Number(divFormStudentCount),
        defaultClassroomId: divFormDefaultRoom,
        subjectIds: divFormSubjects,
      };
      onUpdateEntities({ subjects, teachers, rooms, divisions: [...divisions, newDiv] });
    }
    setIsAddingDivision(false);
    setEditingDivision(null);
  };

  const handleDeleteDivision = (id: string) => {
    if (!confirm('Are you sure you want to delete this division?')) return;
    onUpdateEntities({
      subjects,
      teachers,
      rooms,
      divisions: divisions.filter((d) => d.id !== id),
    });
  };

  // --- Data File Handlers ---
  const handleDownloadDataFile = () => {
    const dataFile: CoordinatorDataFile = {
      collegeName: metaCollege,
      department: metaDept,
      academicYear: metaYear,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      subjects,
      teachers,
      rooms,
      divisions,
    };

    const blob = new Blob([JSON.stringify(dataFile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college_timetable_coordinator_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.subjects || !parsed.teachers || !parsed.rooms || !parsed.divisions) {
          throw new Error('Missing required arrays: subjects, teachers, rooms, divisions');
        }

        onUpdateEntities({
          subjects: parsed.subjects,
          teachers: parsed.teachers,
          rooms: parsed.rooms,
          divisions: parsed.divisions,
          collegeName: parsed.collegeName || metaCollege,
          department: parsed.department || metaDept,
          academicYear: parsed.academicYear || metaYear,
        });

        if (parsed.collegeName) setMetaCollege(parsed.collegeName);
        if (parsed.department) setMetaDept(parsed.department);
        if (parsed.academicYear) setMetaYear(parsed.academicYear);

        setImportStatus(`Successfully loaded data file (${parsed.subjects.length} subjects, ${parsed.teachers.length} teachers, ${parsed.rooms.length} rooms, ${parsed.divisions.length} divisions).`);
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err: any) {
        alert(`Failed to load data file: ${err.message || 'Invalid JSON'}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSampleTemplate = () => {
    if (!confirm('Load the Engineering Computer Science Template? This will replace unsaved changes.')) return;
    onUpdateEntities({
      subjects: INITIAL_SUBJECTS,
      teachers: INITIAL_TEACHERS,
      rooms: INITIAL_ROOMS,
      divisions: INITIAL_DIVISIONS,
      collegeName: 'State Engineering & Technology College',
      department: 'Department of Computer Science & Engineering',
      academicYear: '2026 - 2027 (Odd Semester)',
    });
    setMetaCollege('State Engineering & Technology College');
    setMetaDept('Department of Computer Science & Engineering');
    setMetaYear('2026 - 2027 (Odd Semester)');
  };

  const handleClearAll = () => {
    if (!confirm('Clear all data to start completely blank? You will need to enter subjects, teachers, rooms, and divisions.')) return;
    onUpdateEntities({
      subjects: [],
      teachers: [],
      rooms: [],
      divisions: [],
    });
  };

  const handleSaveMetadata = () => {
    onUpdateEntities({
      subjects,
      teachers,
      rooms,
      divisions,
      collegeName: metaCollege,
      department: metaDept,
      academicYear: metaYear,
    });
    onSaveToDataFile();
  };

  return (
    <div
      id="coordinator-data-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Timetable Coordinator Workspace</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  Data File Input
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Define subjects, teachers for each sub, classrooms, practical labs, and divisions, then save &amp; generate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="save-in-data-file-btn"
              onClick={() => {
                handleSaveMetadata();
                onSaveToDataFile();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Saves configuration to persistent data file"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save in Data File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Feasibility Banner */}
        <div
          className={`px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b ${
            feasibility.isFeasible
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feasibility.isFeasible ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-semibold">
              {feasibility.isFeasible
                ? `Ready to Generate: All constraints satisfied for ${divisions.length} divisions (${feasibility.totalWeeklyHoursRequired} lecture hours required).`
                : `${feasibility.errors.length} issue(s) need attention before timetable can be generated.`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {lastSavedAt && (
              <span className="text-[11px] text-slate-500">
                Last saved: <strong>{lastSavedAt}</strong>
              </span>
            )}
            {feasibility.isFeasible && (
              <button
                onClick={() => {
                  onGenerateTimetable();
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Timetable Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-1 sm:gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'subjects', label: `1. Subjects & Hours (${subjects.length})`, icon: BookOpen },
            { id: 'teachers', label: `2. Teachers for Sub (${teachers.length})`, icon: User },
            { id: 'rooms', label: `3. Classrooms & Labs (${rooms.length})`, icon: Building2 },
            { id: 'divisions', label: `4. Divisions (${divisions.length})`, icon: GraduationCap },
            { id: 'dataFile', label: `5. Data File (.json)`, icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsAddingSubject(false);
                  setIsAddingTeacher(false);
                  setIsAddingRoom(false);
                  setIsAddingDivision(false);
                }}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">College Curriculum &amp; Subjects</h4>
                  <p className="text-xs text-slate-500">
                    Define theory hours, practical lab hours (2-hr blocks), and whether specialized labs are required.
                  </p>
                </div>
                {!isAddingSubject && (
                  <button
                    onClick={handleOpenAddSubject}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Subject</span>
                  </button>
                )}
              </div>

              {/* Add/Edit Subject Form */}
              {isAddingSubject && (
                <form
                  onSubmit={handleSaveSubject}
                  className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      {editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Add New Curriculum Subject'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubject(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Subject Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CS301"
                        value={subFormCode}
                        onChange={(e) => setSubFormCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white uppercase font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Subject Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Data Structures & Algorithms"
                        value={subFormName}
                        onChange={(e) => setSubFormName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Theory Hours / Week</label>
                      <input
                        type="number"
                        min="0"
                        max="6"
                        required
                        value={subFormTheoryHours}
                        onChange={(e) => setSubFormTheoryHours(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-500">1 hour per theory lecture</span>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Practical Hours / Week</label>
                      <select
                        value={subFormPracticalHours}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSubFormPracticalHours(val);
                          if (val > 0) setSubFormIsLab(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">0 hrs (Theory Only)</option>
                        <option value="2">2 hrs/wk (1 continuous lab block)</option>
                        <option value="4">4 hrs/wk (2 continuous lab blocks)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Requires Lab Facility?</label>
                      <div className="flex items-center gap-2 pt-1.5">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={subFormIsLab}
                            onChange={(e) => setSubFormIsLab(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-semibold text-slate-800">
                            {subFormIsLab ? 'Yes (Must schedule in Lab)' : 'No (Classroom only)'}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Color Badge</label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {SUBJECT_COLORS.map((col) => (
                          <button
                            type="button"
                            key={col}
                            onClick={() => setSubFormColor(col)}
                            style={{ backgroundColor: col }}
                            className={`w-6 h-6 rounded-full transition-transform ${
                              subFormColor === col ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'opacity-80 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingSubject(false)}
                      className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                    >
                      {editingSubject ? 'Save Changes' : 'Create Subject'}
                    </button>
                  </div>
                </form>
              )}

              {/* Subject Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjects.map((sub) => {
                  const qualifiedTeachers = teachers.filter((t) => t.qualifiedSubjectIds?.includes(sub.id));
                  const hasTeacher = qualifiedTeachers.length > 0;

                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-2 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: sub.color }}
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                            </div>
                            <span className="font-mono font-bold text-[11px] text-blue-700">{sub.code}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSubject(sub)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Hours Summary */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div className="p-1.5 bg-slate-50 rounded-lg text-center">
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Theory</span>
                          <span className="font-bold text-slate-800">{sub.theoryHoursPerWeek} hrs/wk</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded-lg text-center">
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Practical</span>
                          <span className="font-bold text-slate-800">{sub.practicalHoursPerWeek} hrs/wk</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded-lg text-center">
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Venue</span>
                          <span className={`font-bold ${sub.isLabRequired ? 'text-purple-600' : 'text-slate-600'}`}>
                            {sub.isLabRequired ? 'Lab' : 'Classroom'}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Teachers for this Sub */}
                      <div className="pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Teachers For This Subject:
                        </span>
                        {hasTeacher ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {qualifiedTeachers.map((t) => (
                              <span
                                key={t.id}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  t.isAvailable !== false
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {t.name} {t.isAvailable === false ? '(On Leave)' : ''}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded-lg mt-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>No teacher assigned yet! Go to "Teachers" tab and map a faculty member.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {subjects.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No subjects defined yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "Add New Subject" above or load the college template to get started.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEACHERS & SUBJECT ASSIGNMENT ("teachers for that sub") */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Faculty &amp; Subject Assignments</h4>
                  <p className="text-xs text-slate-500">
                    Map each faculty member to the exact subjects they teach ("teachers for that sub") and set their max weekly hours.
                  </p>
                </div>
                {!isAddingTeacher && (
                  <button
                    onClick={handleOpenAddTeacher}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Faculty Member</span>
                  </button>
                )}
              </div>

              {/* Add/Edit Teacher Form */}
              {isAddingTeacher && (
                <form
                  onSubmit={handleSaveTeacher}
                  className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      {editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Add Faculty Member'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingTeacher(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Faculty Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={teachFormName}
                        onChange={(e) => setTeachFormName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. r.sharma@college.edu"
                        value={teachFormEmail}
                        onChange={(e) => setTeachFormEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Department</label>
                      <input
                        type="text"
                        value={teachFormDept}
                        onChange={(e) => setTeachFormDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Max Weekly Hours (Workload Limit)</label>
                      <input
                        type="number"
                        min="4"
                        max="30"
                        required
                        value={teachFormMaxHours}
                        onChange={(e) => setTeachFormMaxHours(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Current Availability Status</label>
                      <div className="flex items-center gap-2 pt-1.5">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teachFormAvailable}
                            onChange={(e) => setTeachFormAvailable(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className={`font-semibold ${teachFormAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {teachFormAvailable ? 'Available (Can be scheduled)' : 'On Leave (Cannot teach)'}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Preferred Teaching Days</label>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {DAYS_OF_WEEK.map((d) => {
                          const isSelected = teachFormDays.includes(d);
                          return (
                            <button
                              type="button"
                              key={d}
                              onClick={() => {
                                setTeachFormDays(
                                  isSelected ? teachFormDays.filter((day) => day !== d) : [...teachFormDays, d]
                                );
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {d.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CRITICAL: Teachers for that sub selection */}
                  <div className="pt-2 border-t border-blue-100">
                    <label className="block text-slate-800 font-bold mb-1 text-xs">
                      Assign Qualified Subjects ("Teacher for that Sub") *
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Check all the subjects this faculty is qualified and assigned to teach:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {subjects.map((sub) => {
                        const isChecked = teachFormSubjects.includes(sub.id);
                        return (
                          <label
                            key={sub.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-2xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setTeachFormSubjects(
                                  isChecked
                                    ? teachFormSubjects.filter((id) => id !== sub.id)
                                    : [...teachFormSubjects, sub.id]
                                );
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              style={{ backgroundColor: sub.color }}
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-mono text-[10px] font-bold mr-1">{sub.code}</span>
                              <span className="truncate">{sub.name}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {subjects.length === 0 && (
                      <p className="text-rose-600 text-xs mt-1">Please create subjects in Tab 1 first.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingTeacher(false)}
                      className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                    >
                      {editingTeacher ? 'Save Faculty' : 'Add Faculty'}
                    </button>
                  </div>
                </form>
              )}

              {/* Teacher Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teachers.map((t) => {
                  const qualifiedSubjects = subjects.filter((s) => t.qualifiedSubjectIds?.includes(s.id));
                  const isAvailable = t.isAvailable !== false;

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border text-xs transition-all shadow-2xs ${
                        isAvailable ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                          <p className="text-[11px] text-slate-500">{t.email} • {t.department}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditTeacher(t)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit Faculty"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete Faculty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Max Workload:</span>
                          <span className="font-bold text-slate-800">{t.maxWeeklyHours} hrs/week</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span>Status:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'On Leave'}
                          </span>
                        </div>

                        {t.preferredDays && t.preferredDays.length < 5 && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Preferred Days:</span>
                            <span className="font-semibold text-slate-700">{t.preferredDays.join(', ')}</span>
                          </div>
                        )}

                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                            Assigned Subjects ({qualifiedSubjects.length}):
                          </span>
                          {qualifiedSubjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {qualifiedSubjects.map((s) => (
                                <span
                                  key={s.id}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200"
                                >
                                  {s.code} ({s.name})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-rose-600 text-[11px] font-semibold">
                              No subjects assigned yet. Click edit to map subjects.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {teachers.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No faculty members added yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add teachers and map them to their respective subjects.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLASSROOMS & PRACTICAL LABS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Classrooms Available &amp; Respective Labs</h4>
                  <p className="text-xs text-slate-500">
                    Register lecture halls for theory and specialized computer/science labs for continuous 2-hour practical blocks.
                  </p>
                </div>
                {!isAddingRoom && (
                  <button
                    onClick={handleOpenAddRoom}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Room / Lab</span>
                  </button>
                )}
              </div>

              {/* Add/Edit Room Form */}
              {isAddingRoom && (
                <form
                  onSubmit={handleSaveRoom}
                  className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      {editingRoom ? `Edit Room: ${editingRoom.name}` : 'Add Room or Practical Lab'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingRoom(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Room / Lab Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lecture Hall 101 or AI Lab"
                        value={roomFormName}
                        onChange={(e) => setRoomFormName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Facility Type *</label>
                      <select
                        value={roomFormType}
                        onChange={(e) => setRoomFormType(e.target.value as RoomType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="classroom">Classroom (Theory Lectures)</option>
                        <option value="lab">Practical Lab (Continuous Practical Blocks)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Seating Capacity</label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        required
                        value={roomFormCapacity}
                        onChange={(e) => setRoomFormCapacity(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Building / Floor</label>
                      <input
                        type="text"
                        placeholder="e.g. Academic Block A"
                        value={roomFormBuilding}
                        onChange={(e) => setRoomFormBuilding(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingRoom(false)}
                      className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                    >
                      {editingRoom ? 'Save Room' : 'Add Room'}
                    </button>
                  </div>
                </form>
              )}

              {/* Rooms & Labs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditRoom(r)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                          r.type === 'lab'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.type === 'lab' ? (
                          <>
                            <FlaskConical className="w-3 h-3" />
                            Practical Lab
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3" />
                            Theory Classroom
                          </>
                        )}
                      </span>
                      <span className="text-slate-500 text-[11px]">{r.capacity} seats</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{r.building}</p>
                  </div>
                ))}
              </div>

              {rooms.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No rooms or labs registered</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add classrooms for lectures and labs for practicals.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DIVISIONS & CURRICULUM */}
          {activeTab === 'divisions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Student Divisions &amp; Curriculum Mapping</h4>
                  <p className="text-xs text-slate-500">
                    Create student divisions (e.g. Div A, Div B) and assign which curriculum subjects they attend.
                  </p>
                </div>
                {!isAddingDivision && (
                  <button
                    onClick={handleOpenAddDivision}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Division</span>
                  </button>
                )}
              </div>

              {/* Add/Edit Division Form */}
              {isAddingDivision && (
                <form
                  onSubmit={handleSaveDivision}
                  className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      {editingDivision ? `Edit Division: ${editingDivision.name}` : 'Add New Division'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingDivision(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Division Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CS - 3rd Year (Div A)"
                        value={divFormName}
                        onChange={(e) => setDivFormName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Department</label>
                      <input
                        type="text"
                        value={divFormDept}
                        onChange={(e) => setDivFormDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Semester</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        required
                        value={divFormSemester}
                        onChange={(e) => setDivFormSemester(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Student Strength</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        required
                        value={divFormStudentCount}
                        onChange={(e) => setDivFormStudentCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Default Classroom</label>
                      <select
                        value={divFormDefaultRoom}
                        onChange={(e) => setDivFormDefaultRoom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Auto-Assign from available rooms</option>
                        {rooms
                          .filter((r) => r.type === 'classroom')
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.capacity} seats)
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Curriculum Assignment */}
                  <div className="pt-2 border-t border-blue-100">
                    <label className="block text-slate-800 font-bold mb-1 text-xs">
                      Assigned Curriculum Subjects *
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Select all subjects this division attends each week:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {subjects.map((sub) => {
                        const isChecked = divFormSubjects.includes(sub.id);
                        return (
                          <label
                            key={sub.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setDivFormSubjects(
                                  isChecked
                                    ? divFormSubjects.filter((id) => id !== sub.id)
                                    : [...divFormSubjects, sub.id]
                                );
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              style={{ backgroundColor: sub.color }}
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-mono text-[10px] font-bold mr-1">{sub.code}</span>
                              <span className="truncate">{sub.name}</span>
                              <span className="text-[10px] text-slate-500 ml-1">
                                ({sub.theoryHoursPerWeek}T + {sub.practicalHoursPerWeek}P)
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingDivision(false)}
                      className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                    >
                      {editingDivision ? 'Save Division' : 'Add Division'}
                    </button>
                  </div>
                </form>
              )}

              {/* Divisions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {divisions.map((d) => {
                  const divSubjects = subjects.filter((s) => d.subjectIds?.includes(s.id));
                  const defaultRoom = rooms.find((r) => r.id === d.defaultClassroomId);
                  const totalHours = divSubjects.reduce(
                    (sum, s) => sum + s.theoryHoursPerWeek + s.practicalHoursPerWeek,
                    0
                  );

                  return (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                          <p className="text-slate-500 text-[11px]">{d.department} • Sem {d.semester}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditDivision(d)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDivision(d.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Strength:</span>
                          <strong>{d.studentCount} Students</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Default Room:</span>
                          <strong>{defaultRoom?.name || 'Dynamic'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Weekly Workload:</span>
                          <strong className={totalHours > 35 ? 'text-rose-600' : 'text-slate-800'}>
                            {totalHours} hrs/week
                          </strong>
                        </div>

                        <div className="mt-2">
                          <span className="font-bold text-slate-700 block mb-1">
                            Curriculum ({divSubjects.length} subjects):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {divSubjects.map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-800 border border-slate-200"
                              >
                                {s.code}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {divisions.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No student divisions configured yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add divisions (e.g. Div A, Div B) to generate timetable slots for.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DATA FILE (.json) MANAGEMENT */}
          {activeTab === 'dataFile' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Coordinator Data File Persistence</h4>
                <p className="text-xs text-slate-500">
                  Save, export, or import your college's complete timetable configuration file (.json).
                </p>
              </div>

              {importStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

              {/* College Metadata Settings */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h5 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  Institutional Details (Stored in Data File)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">College / Institute Name</label>
                    <input
                      type="text"
                      value={metaCollege}
                      onChange={(e) => setMetaCollege(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={metaDept}
                      onChange={(e) => setMetaDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Academic Year / Semester</label>
                    <input
                      type="text"
                      value={metaYear}
                      onChange={(e) => setMetaYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons for Physical Data File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Save in Data File */}
                <button
                  onClick={() => {
                    handleSaveMetadata();
                    onSaveToDataFile();
                  }}
                  className="flex flex-col items-center text-center p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Save className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-emerald-950 text-xs">Save in Data File</span>
                  <span className="text-[10px] text-emerald-700 mt-1">
                    Commits active configuration to persistent local storage
                  </span>
                </button>

                {/* 2. Download JSON */}
                <button
                  onClick={handleDownloadDataFile}
                  className="flex flex-col items-center text-center p-4 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-2xl transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-blue-950 text-xs">Download Data File (.json)</span>
                  <span className="text-[10px] text-blue-700 mt-1">
                    Export JSON file to your computer for backup or sharing
                  </span>
                </button>

                {/* 3. Upload JSON */}
                <div className="flex flex-col items-center text-center p-4 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-2xl transition-all cursor-pointer shadow-2xs group relative">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-purple-950 text-xs">Upload Data File (.json)</span>
                  <span className="text-[10px] text-purple-700 mt-1">
                    Load an existing coordinator JSON data file
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileImport}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

                {/* 4. Template Preset */}
                <button
                  onClick={handleLoadSampleTemplate}
                  className="flex flex-col items-center text-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs">Load College Template</span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Pre-fills engineering curriculum &amp; divisions
                  </span>
                </button>
              </div>

              {/* Reset to Blank option */}
              <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <span>Want to start with zero data and type your college's schedule from scratch?</span>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Start Fresh / Blank
                </button>
              </div>

              {/* Data Summary & JSON Preview */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Data File Schema Preview:</span>
                  <span>
                    {subjects.length} subjects • {teachers.length} faculty • {rooms.length} rooms • {divisions.length} divisions
                  </span>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] max-h-48 text-emerald-400">
                  {JSON.stringify(
                    {
                      collegeName: metaCollege,
                      department: metaDept,
                      academicYear: metaYear,
                      counts: {
                        subjects: subjects.length,
                        teachers: teachers.length,
                        rooms: rooms.length,
                        divisions: divisions.length,
                      },
                      sampleSubject: subjects[0] || null,
                      sampleTeacher: teachers[0] || null,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Generation Action */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>
              Configured: <strong>{subjects.length}</strong> subjects, <strong>{teachers.length}</strong> teachers,{' '}
              <strong>{rooms.length}</strong> rooms/labs, <strong>{divisions.length}</strong> divisions.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-200/60 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              id="coordinator-generate-timetable-btn"
              disabled={!feasibility.isFeasible}
              onClick={() => {
                onSaveToDataFile();
                onGenerateTimetable();
                onClose();
              }}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition-all cursor-pointer ${
                feasibility.isFeasible
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-98'
                  : 'bg-slate-400 cursor-not-allowed opacity-70'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Timetable According to Above Factors</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
