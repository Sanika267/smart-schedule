import React, { useState, useMemo } from 'react';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  Division,
  Room,
  Subject,
  Teacher,
  TimetableEntry,
} from '../types/timetable';
import { STANDARD_PERIODS, LUNCH_PERIOD_INDEX } from '../data/mockData';
import { validateSlotAssignment } from '../algorithms/clashDetector';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Trash2,
  User,
  X,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  entry: TimetableEntry | null;
  allEntries: TimetableEntry[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  divisions: Division[];
  onClose: () => void;
  onSave: (updatedEntry: TimetableEntry) => void;
  onDelete: (entryId: string) => void;
}

export const ManualEditModal: React.FC<Props> = ({
  isOpen,
  entry,
  allEntries,
  subjects,
  teachers,
  rooms,
  divisions,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !entry) return null;

  const [day, setDay] = useState<DayOfWeek>(entry.day);
  const [slotIndex, setSlotIndex] = useState<number>(entry.slotIndex);
  const [roomId, setRoomId] = useState<string>(entry.roomId);
  const [teacherId, setTeacherId] = useState<string>(entry.teacherId);
  const [durationSlots, setDurationSlots] = useState<number>(entry.durationSlots);
  const [allowForceOverride, setAllowForceOverride] = useState(false);

  const subject = subjects.find((s) => s.id === entry.subjectId);
  const division = divisions.find((d) => d.id === entry.divisionId);

  // Dynamic Real-time Clash Validation
  const validation = useMemo(() => {
    const candidate: TimetableEntry = {
      ...entry,
      day,
      slotIndex,
      roomId,
      teacherId,
      durationSlots,
      isPractical: durationSlots > 1 || entry.isPractical,
    };

    return validateSlotAssignment(candidate, allEntries, teachers, rooms, subjects, divisions);
  }, [entry, day, slotIndex, roomId, teacherId, durationSlots, allEntries, teachers, rooms, subjects, divisions]);

  const handleSave = () => {
    if (!validation.isValid && !allowForceOverride) return;

    onSave({
      ...entry,
      day,
      slotIndex,
      roomId,
      teacherId,
      durationSlots,
      isPractical: durationSlots > 1 || entry.isPractical,
    });
    onClose();
  };

  return (
    <div id="manual-edit-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Manual Override: Edit Lecture
            </h3>
            <p className="text-xs text-slate-500">
              {division?.name} • {subject?.name} ({subject?.code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Validation Banner */}
          {validation.isValid ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Clash-Free Configuration</p>
                <p className="text-[11px] text-emerald-700">
                  Teacher, classroom, and student division are all free at this slot.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-rose-900">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Scheduling Collision Detected ({validation.clashes.length})</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] text-rose-700 space-y-1">
                {validation.clashes.map((c, i) => (
                  <li key={i}>{c.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1">
              <p className="font-semibold text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Soft Constraint Advisory:
              </p>
              <ul className="list-disc pl-5 text-[11px] text-amber-700 space-y-0.5">
                {validation.warnings.map((w, i) => (
                  <li key={i}>{w.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* Day */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Day of Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
              <select
                value={slotIndex}
                onChange={(e) => setSlotIndex(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {STANDARD_PERIODS.map((p) => (
                  <option
                    key={p.id}
                    value={p.periodIndex}
                    disabled={p.isBreak}
                    className={p.isBreak ? 'bg-amber-50 text-amber-800 font-semibold' : ''}
                  >
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Faculty</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {teachers.map((t) => {
                  const isQualified = subject ? t.qualifiedSubjectIds.includes(subject.id) : false;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} {isQualified ? '✓ (Qualified)' : '✗ (Unqualified)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Classroom / Lab */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Classroom / Lab</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type === 'lab' ? 'Lab' : 'Classroom'})
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDurationSlots(1)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    durationSlots === 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  1 Hour (Theory Lecture)
                </button>
                <button
                  type="button"
                  onClick={() => setDurationSlots(2)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    durationSlots === 2
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  2 Hours (Continuous Lab Block)
                </button>
              </div>
            </div>
          </div>

          {/* Force Override Toggle for Admins */}
          {!validation.isValid && (
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={allowForceOverride}
                  onChange={(e) => setAllowForceOverride(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Force Override (Bypass constraint checks)
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this scheduled lecture?')) {
                onDelete(entry.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Lecture
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!validation.isValid && !allowForceOverride}
              onClick={handleSave}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors ${
                validation.isValid || allowForceOverride
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Save & Validate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
