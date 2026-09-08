import React, { useState, useMemo } from 'react';
import {
  DayOfWeek,
  Division,
  Room,
  Subject,
  SubstituteCandidate,
  Teacher,
  TimetableEntry,
} from '../types/timetable';
import { findSubstituteTeachers } from '../algorithms/substituteFinder';
import { STANDARD_PERIODS } from '../data/mockData';
import {
  UserCheck,
  Award,
  Calendar,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  entry: TimetableEntry | null;
  allEntries: TimetableEntry[];
  teachers: Teacher[];
  subjects: Subject[];
  divisions: Division[];
  rooms: Room[];
  onClose: () => void;
  onAssignSubstitute: (
    entryId: string,
    substituteTeacherId: string,
    reason: string
  ) => void;
  onRevertSubstitute: (entryId: string) => void;
}

export const SubstituteModal: React.FC<Props> = ({
  isOpen,
  entry,
  allEntries,
  teachers,
  subjects,
  divisions,
  rooms,
  onClose,
  onAssignSubstitute,
  onRevertSubstitute,
}) => {
  if (!isOpen || !entry) return null;

  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [absenceReason, setAbsenceReason] = useState<string>('Medical Leave / Personal Emergency');

  const subject = subjects.find((s) => s.id === entry.subjectId);
  const absentTeacherId = entry.originalTeacherId || entry.teacherId;
  const absentTeacher = teachers.find((t) => t.id === absentTeacherId);
  const division = divisions.find((d) => d.id === entry.divisionId);
  const room = rooms.find((r) => r.id === entry.roomId);

  const slotInfo = STANDARD_PERIODS.find((p) => p.periodIndex === entry.slotIndex);

  // Compute Candidates
  const candidates = useMemo(() => {
    return findSubstituteTeachers(
      absentTeacherId,
      entry.subjectId,
      entry.day,
      entry.slotIndex,
      entry.durationSlots,
      allEntries,
      teachers,
      subjects
    );
  }, [absentTeacherId, entry, allEntries, teachers, subjects]);

  const handleAssign = (candidate: SubstituteCandidate) => {
    onAssignSubstitute(entry.id, candidate.teacher.id, absenceReason);
    onClose();
  };

  return (
    <div id="substitute-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Substitute Faculty Assignment & Recommendation
              </h3>
              <p className="text-xs text-slate-500">
                AI Constraint-Based Substitute Finder with Workload Balancing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Affected Lecture Details Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Absent Faculty:</span>
              <p className="font-bold text-slate-900">{absentTeacher?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Subject & Class:</span>
              <p className="font-semibold text-slate-800">{subject?.name} • {division?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Time & Venue:</span>
              <p className="font-semibold text-slate-800">{entry.day}, {slotInfo?.label} ({room?.name})</p>
            </div>
          </div>

          {entry.isSubstituted && (
            <button
              onClick={() => {
                onRevertSubstitute(entry.id);
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Revert to Original Faculty
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Ranked Qualified Candidates ({candidates.length})
            </h4>
            <span className="text-[11px] text-slate-500">
              Ranked by clash check + workload fairness + proximity
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              No other faculty members are certified/qualified for {subject?.name}.
            </div>
          ) : (
            <div className="space-y-2.5">
              {candidates.map((cand, idx) => {
                const isBestMatch = idx === 0 && cand.isFree;
                return (
                  <div
                    key={cand.teacher.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      cand.isFree
                        ? isBestMatch
                          ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {cand.teacher.name}
                        </span>
                        {isBestMatch && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            <Award className="w-3 h-3" />
                            Best Match
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            cand.isFree
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {cand.isFree ? 'Free at this slot' : 'Busy / Clash'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{cand.reason}</p>

                      {/* Suitability score breakdown */}
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500">
                        <span>Workload: {cand.currentWeeklyHours}/{cand.maxWeeklyHours} hrs</span>
                        <span>•</span>
                        <span>Dept: {cand.teacher.department}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          Suitability: {cand.suitabilityScore}/100 pts
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={!cand.isFree}
                      onClick={() => handleAssign(cand)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors shadow-xs ${
                        cand.isFree
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Assign Substitute
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Assigning a substitute will automatically notify enrolled students and faculty.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
