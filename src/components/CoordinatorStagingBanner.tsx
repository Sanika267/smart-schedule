import React from 'react';
import {
  Division,
  FeasibilityReport,
  Room,
  Subject,
  Teacher,
} from '../types/timetable';
import {
  AlertCircle,
  BookOpen,
  Building2,
  CheckCircle2,
  Download,
  FileCode,
  FlaskConical,
  GraduationCap,
  Save,
  Sparkles,
  User,
  Users,
  Lock,
  Printer,
} from 'lucide-react';

interface Props {
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  divisions: Division[];
  hasGenerated: boolean;
  userRole?: 'admin' | 'faculty' | 'student';
  onOpenCoordinatorHub: () => void;
  onGenerateTimetable: () => void;
  onSaveToDataFile: () => void;
  onDownloadDataFile: () => void;
  onPrint?: () => void;
  lastSavedAt: string | null;
  feasibility: FeasibilityReport;
  collegeName: string;
  department: string;
}

export const CoordinatorStagingBanner: React.FC<Props> = ({
  subjects,
  teachers,
  rooms,
  divisions,
  hasGenerated,
  userRole = 'admin',
  onOpenCoordinatorHub,
  onGenerateTimetable,
  onSaveToDataFile,
  onDownloadDataFile,
  onPrint,
  lastSavedAt,
  feasibility,
  collegeName,
  department,
}) => {
  const classrooms = rooms.filter((r) => r.type === 'classroom');
  const labs = rooms.filter((r) => r.type === 'lab');
  const practicalSubjects = subjects.filter((s) => s.practicalHoursPerWeek > 0 || s.isLabRequired);

  const isAdmin = userRole === 'admin';

  return (
    <div
      id="coordinator-staging-banner"
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
    >
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {isAdmin
                ? 'Timetable Coordinator Configuration Hub'
                : 'Academic Schedule & Department Overview'}
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                hasGenerated
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isAdmin
                ? hasGenerated
                  ? 'Timetable Active'
                  : 'Awaiting Generation'
                : userRole === 'faculty'
                ? 'Faculty Portal (Read-Only)'
                : 'Student Portal (Read-Only)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {collegeName} • {department}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <>
              <button
                id="coordinator-banner-configure-btn"
                onClick={onOpenCoordinatorHub}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Configure College Data</span>
              </button>

              <button
                id="coordinator-banner-save-btn"
                onClick={onSaveToDataFile}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="Save academic inputs to data file"
              >
                <Save className="w-3.5 h-3.5 text-emerald-600" />
                <span>Save in Data File</span>
              </button>

              <button
                id="coordinator-banner-download-btn"
                onClick={onDownloadDataFile}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Download JSON data file to computer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Download .json</span>
              </button>

              {!hasGenerated && (
                <button
                  id="coordinator-banner-generate-btn"
                  disabled={!feasibility.isFeasible}
                  onClick={onGenerateTimetable}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                    feasibility.isFeasible
                      ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
                      : 'bg-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Timetable</span>
                </button>
              )}
            </>
          ) : (
            <>
              {onPrint && (
                <button
                  id="read-only-print-btn"
                  onClick={onPrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Timetable</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Read-Only Access</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5 Factors Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {/* Factor 1: Subjects */}
        <div
          onClick={isAdmin ? onOpenCoordinatorHub : undefined}
          className={`p-3 rounded-xl border border-slate-200 space-y-1 transition-colors ${
            isAdmin
              ? 'bg-slate-50 hover:bg-blue-50/40 cursor-pointer'
              : 'bg-slate-50/60 cursor-default'
          }`}
          title={isAdmin ? 'Click to configure subjects' : 'Curriculum Subjects'}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600">1. Subjects</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{subjects.length}</p>
          <p className="text-[11px] text-slate-500">
            {practicalSubjects.length} with lab practicals
          </p>
        </div>

        {/* Factor 2: Teachers for that sub */}
        <div
          onClick={isAdmin ? onOpenCoordinatorHub : undefined}
          className={`p-3 rounded-xl border border-slate-200 space-y-1 transition-colors ${
            isAdmin
              ? 'bg-slate-50 hover:bg-blue-50/40 cursor-pointer'
              : 'bg-slate-50/60 cursor-default'
          }`}
          title={isAdmin ? 'Click to configure teachers & subject mappings' : 'Faculty Pool'}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600">2. Teachers for Sub</span>
            <User className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{teachers.length}</p>
          <p className="text-[11px] text-slate-500">
            {teachers.filter((t) => t.isAvailable !== false).length} active faculty
          </p>
        </div>

        {/* Factor 3: Classrooms available */}
        <div
          onClick={isAdmin ? onOpenCoordinatorHub : undefined}
          className={`p-3 rounded-xl border border-slate-200 space-y-1 transition-colors ${
            isAdmin
              ? 'bg-slate-50 hover:bg-blue-50/40 cursor-pointer'
              : 'bg-slate-50/60 cursor-default'
          }`}
          title={isAdmin ? 'Click to configure classrooms' : 'Theory Classrooms'}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600">3. Classrooms</span>
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{classrooms.length}</p>
          <p className="text-[11px] text-slate-500">Theory lecture halls</p>
        </div>

        {/* Factor 4: Practical slots & respective labs */}
        <div
          onClick={isAdmin ? onOpenCoordinatorHub : undefined}
          className={`p-3 rounded-xl border border-slate-200 space-y-1 transition-colors ${
            isAdmin
              ? 'bg-slate-50 hover:bg-blue-50/40 cursor-pointer'
              : 'bg-slate-50/60 cursor-default'
          }`}
          title={isAdmin ? 'Click to configure practical labs' : 'Specialized Laboratories'}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600">4. Practical Labs</span>
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{labs.length}</p>
          <p className="text-[11px] text-slate-500">2-hr continuous slots</p>
        </div>

        {/* Factor 5: Student Divisions */}
        <div
          onClick={isAdmin ? onOpenCoordinatorHub : undefined}
          className={`p-3 rounded-xl border border-slate-200 space-y-1 transition-colors ${
            isAdmin
              ? 'bg-slate-50 hover:bg-blue-50/40 cursor-pointer'
              : 'bg-slate-50/60 cursor-default'
          }`}
          title={isAdmin ? 'Click to configure student divisions' : 'Student Divisions'}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-600">5. Divisions</span>
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{divisions.length}</p>
          <p className="text-[11px] text-slate-500">
            {divisions.map((d) => d.name.split(' ')[0]).join(', ') || 'None'}
          </p>
        </div>
      </div>

      {/* Persistence & Readiness Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isAdmin
              ? `Storage: Persistent Browser Data File (${
                  lastSavedAt ? `Saved at ${lastSavedAt}` : 'Ready to save'
                })`
              : 'Academic Timetable System • Verified Published Schedule'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            feasibility.isFeasible ? (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All coordinator inputs verified &amp; feasible
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {feasibility.errors.length} requirement(s) pending in coordinator data
              </span>
            )
          ) : (
            <span className="flex items-center gap-1 text-blue-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Clash-free constraints enforced (100% verified)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
