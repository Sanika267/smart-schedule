import React from 'react';
import { Division, Room, Subject, Teacher, TimetableEntry } from '../types/timetable';
import { STANDARD_PERIODS } from '../data/mockData';
import {
  Calendar,
  Clock,
  FlaskConical,
  GraduationCap,
  Info,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  User,
  UserCheck,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  entry: TimetableEntry | null;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  divisions: Division[];
  onClose: () => void;
  userRole: 'admin' | 'faculty' | 'student';
  onAdminEdit?: (entry: TimetableEntry) => void;
}

export const LectureDetailModal: React.FC<Props> = ({
  isOpen,
  entry,
  subjects,
  teachers,
  rooms,
  divisions,
  onClose,
  userRole,
  onAdminEdit,
}) => {
  if (!isOpen || !entry) return null;

  const subject = subjects.find((s) => s.id === entry.subjectId);
  const teacher = teachers.find((t) => t.id === entry.teacherId);
  const originalTeacher = entry.originalTeacherId
    ? teachers.find((t) => t.id === entry.originalTeacherId)
    : null;
  const room = rooms.find((r) => r.id === entry.roomId);
  const division = divisions.find((d) => d.id === entry.divisionId);

  const period = STANDARD_PERIODS.find((p) => p.periodIndex === entry.slotIndex);
  const endPeriod =
    entry.durationSlots > 1
      ? STANDARD_PERIODS.find((p) => p.periodIndex === entry.slotIndex + entry.durationSlots - 1)
      : period;

  const timeRangeString =
    period && endPeriod
      ? `${period.startTime} - ${endPeriod.endTime}`
      : `Period ${entry.slotIndex + 1}`;

  return (
    <div
      id="lecture-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="lecture-detail-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 border-b border-slate-100 flex items-start justify-between gap-4"
          style={{
            background: subject?.color
              ? `linear-gradient(135deg, ${subject.color}15 0%, #ffffff 100%)`
              : '#f8fafc',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
              style={{ backgroundColor: subject?.color || '#3b82f6' }}
            >
              {entry.isPractical ? (
                <FlaskConical className="w-5 h-5" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-bold"
                  style={{
                    backgroundColor: `${subject?.color || '#3b82f6'}25`,
                    color: subject?.color || '#2563eb',
                  }}
                >
                  {subject?.code || 'SUB'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                    entry.isPractical
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {entry.isPractical ? '2-Hour Practical Lab' : 'Theory Lecture'}
                </span>
                {entry.isSubstituted && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Substitute Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                {subject?.name || 'Class Session'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Details */}
        <div className="p-5 space-y-4 text-xs">
          {/* Timing & Day Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Day</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{entry.day}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time Slot</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{timeRangeString}</p>
              </div>
            </div>
          </div>

          {/* Assigned Faculty */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Faculty Instructor
              </span>
              {entry.isSubstituted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Substitute Assigned
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {teacher?.name || 'Faculty Member'}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {teacher?.email || 'faculty@college.edu'} • {teacher?.department}
                </p>
              </div>
            </div>

            {/* If Substituted, show explanation */}
            {entry.isSubstituted && (
              <div className="pt-2 border-t border-amber-200/70 text-amber-900 bg-amber-50/80 p-2.5 rounded-lg text-[11px] space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  Original Faculty: {originalTeacher?.name || 'Assigned Instructor'}
                </p>
                {entry.substitutionReason && (
                  <p className="text-amber-700 italic">
                    Reason: "{entry.substitutionReason}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Room / Lab & Class Division */}
          <div className="grid grid-cols-2 gap-3">
            {/* Room Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Room / Venue
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">{room?.name || 'Room'}</p>
              <p className="text-[10px] text-slate-500">
                {room?.type === 'lab' ? 'Practical Lab' : 'Lecture Hall'} • Capacity {room?.capacity || 60}
              </p>
            </div>

            {/* Division Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                Target Class
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">{division?.name || 'Class'}</p>
              <p className="text-[10px] text-slate-500">
                {division?.department} • {division?.studentCount || 60} Students
              </p>
            </div>
          </div>

          {/* Role Access Notice */}
          {userRole !== 'admin' ? (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <strong>Read-Only Mode:</strong> Logged in as <strong>{userRole === 'faculty' ? 'Faculty / Teacher' : 'Student'}</strong>. Only Timetable Administrators can alter lecture timings, classrooms, or faculty assignments.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px]">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>You are viewing this lecture as <strong>Administrator</strong>.</span>
              </div>
              {onAdminEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onAdminEdit(entry);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                >
                  Edit / Relocate
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
