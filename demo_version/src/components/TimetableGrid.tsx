import React from 'react';
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
import { Clock, MapPin, User, AlertCircle, Sparkles, Edit2, UserPlus, FlaskConical, Lock, Eye } from 'lucide-react';

interface Props {
  entries: TimetableEntry[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  divisions: Division[];
  selectedDivisionId: string | 'all';
  selectedTeacherId: string | 'all';
  selectedRoomId: string | 'all';
  userRole?: 'admin' | 'faculty' | 'student';
  onSelectEntry: (entry: TimetableEntry) => void;
  onFindSubstitute: (entry: TimetableEntry) => void;
  onEmptySlotClick: (day: DayOfWeek, slotIndex: number) => void;
  onGenerateTimetable?: () => void;
  onOpenCoordinatorHub?: () => void;
}

export const TimetableGrid: React.FC<Props> = ({
  entries,
  subjects,
  teachers,
  rooms,
  divisions,
  selectedDivisionId,
  selectedTeacherId,
  selectedRoomId,
  userRole = 'admin',
  onSelectEntry,
  onFindSubstitute,
  onEmptySlotClick,
  onGenerateTimetable,
  onOpenCoordinatorHub,
}) => {
  // Filter entries based on current view criteria
  const filteredEntries = entries.filter((entry) => {
    if (selectedDivisionId !== 'all' && entry.divisionId !== selectedDivisionId) return false;
    if (selectedTeacherId !== 'all' && entry.teacherId !== selectedTeacherId) return false;
    if (selectedRoomId !== 'all' && entry.roomId !== selectedRoomId) return false;
    return true;
  });

  const subjectsMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const teachersMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const roomsMap = new Map<string, Room>(rooms.map((r) => [r.id, r]));
  const divisionsMap = new Map<string, Division>(divisions.map((d) => [d.id, d]));

  return (
    <div id="timetable-grid-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Empty State Callout when entries === 0 */}
      {entries.length === 0 && (
        <div className="p-4 sm:p-5 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {userRole === 'admin' ? 'Timetable Not Yet Generated' : 'Academic Timetable Pending Publication'}
              </h4>
              <p className="text-xs text-slate-600">
                {userRole === 'admin'
                  ? `Coordinator inputs are configured (${divisions.length} divisions, ${subjects.length} subjects, ${teachers.length} faculty, ${rooms.length} rooms). Click to generate clash-free schedule.`
                  : 'The master timetable has not been published yet by the Timetable Administrator. Please check back soon or contact your department head.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'admin' ? (
              <>
                {onOpenCoordinatorHub && (
                  <button
                    onClick={onOpenCoordinatorHub}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Edit College Data
                  </button>
                )}
                {onGenerateTimetable && (
                  <button
                    onClick={onGenerateTimetable}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Timetable</span>
                  </button>
                )}
              </>
            ) : (
              <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                {userRole === 'faculty' ? 'Faculty Portal (Read-Only)' : 'Student Portal (Read-Only)'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <th className="p-3.5 text-left text-xs font-bold uppercase tracking-wider w-28 border-r border-slate-200">
                Day / Time
              </th>
              {STANDARD_PERIODS.map((period) => (
                <th
                  key={period.id}
                  className={`p-2.5 text-center text-xs font-semibold border-r border-slate-200 last:border-r-0 ${
                    period.isBreak ? 'bg-amber-50/70 text-amber-800 w-24' : 'text-slate-600'
                  }`}
                >
                  <div className="font-bold">{period.startTime} - {period.endTime}</div>
                  <div className="text-[10px] font-normal text-slate-500">
                    {period.isBreak ? 'LUNCH BREAK' : `Period ${period.periodIndex + 1}`}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {DAYS_OF_WEEK.map((day) => {
              // Track rendered columns to handle durationSlots = 2 (colSpan = 2)
              let skipNextCol = false;

              return (
                <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                  {/* Day Header */}
                  <td className="p-3.5 font-bold text-sm text-slate-800 bg-slate-50/80 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {day}
                    </div>
                  </td>

                  {/* 8 Periods */}
                  {STANDARD_PERIODS.map((period) => {
                    const slotIndex = period.periodIndex;

                    if (skipNextCol) {
                      skipNextCol = false;
                      return null; // already rendered as part of colSpan
                    }

                    // Lunch Break Slot
                    if (period.isBreak) {
                      return (
                        <td
                          key={`${day}-${slotIndex}`}
                          className="p-2 text-center bg-amber-50/40 border-r border-slate-200 text-amber-700/80 text-xs font-medium italic select-none"
                        >
                          <div className="py-8 flex flex-col items-center justify-center gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Lunch</span>
                            <span className="text-[10px] text-amber-600">1:00 - 2:00 PM</span>
                          </div>
                        </td>
                      );
                    }

                    // Check if an entry starts at this slot
                    const entryAtSlot = filteredEntries.find(
                      (e) => e.day === day && e.slotIndex === slotIndex
                    );

                    // Check if an entry started earlier and spans into this slot
                    const entrySpanningIntoSlot = filteredEntries.find(
                      (e) => e.day === day && e.slotIndex < slotIndex && e.slotIndex + e.durationSlots > slotIndex
                    );

                    if (entrySpanningIntoSlot) {
                      return null; // Spanned by previous column
                    }

                    if (entryAtSlot) {
                      const subject = subjectsMap.get(entryAtSlot.subjectId);
                      const teacher = teachersMap.get(entryAtSlot.teacherId);
                      const originalTeacher = entryAtSlot.originalTeacherId
                        ? teachersMap.get(entryAtSlot.originalTeacherId)
                        : null;
                      const room = roomsMap.get(entryAtSlot.roomId);
                      const division = divisionsMap.get(entryAtSlot.divisionId);
                      const isMultiSlot = entryAtSlot.durationSlots > 1;

                      if (isMultiSlot) {
                        skipNextCol = true;
                      }

                      return (
                        <td
                          key={`${day}-${slotIndex}`}
                          colSpan={entryAtSlot.durationSlots}
                          className="p-1.5 border-r border-slate-200 align-top"
                        >
                          <div
                            id={`lecture-card-${entryAtSlot.id}`}
                            style={{ borderLeftColor: subject?.color || '#3B82F6' }}
                            className={`group relative h-full rounded-xl border-l-4 p-2.5 bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
                              entryAtSlot.isPractical ? 'bg-cyan-50/20' : ''
                            } ${entryAtSlot.isSubstituted ? 'ring-1 ring-amber-400 bg-amber-50/20' : ''}`}
                            onClick={() => onSelectEntry(entryAtSlot)}
                          >
                            <div>
                              {/* Badges */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span
                                  style={{ backgroundColor: `${subject?.color || '#3B82F6'}15`, color: subject?.color || '#2563EB' }}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight"
                                >
                                  {subject?.code || 'SUB'}
                                </span>

                                {entryAtSlot.isPractical ? (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-semibold">
                                    <FlaskConical className="w-3 h-3" />
                                    2-Hr Lab
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">Theory</span>
                                )}
                              </div>

                              {/* Subject Title */}
                              <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {subject?.name || 'Subject'}
                              </p>

                              {/* Division info (especially useful when in teacher or room view) */}
                              {selectedDivisionId === 'all' && (
                                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                                  {division?.name || 'Class'}
                                </p>
                              )}
                            </div>

                            {/* Teacher and Room Footer */}
                            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className={`truncate font-medium ${entryAtSlot.isSubstituted ? 'text-amber-800 font-semibold' : ''}`}>
                                  {teacher?.name || 'Faculty'}
                                </span>
                              </div>

                              {entryAtSlot.isSubstituted && (
                                <div className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-medium truncate">
                                  Sub for {originalTeacher?.name || 'Faculty'}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-slate-500 text-[10px]">
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  {room?.name || 'Room'}
                                </span>
                              </div>
                            </div>

                            {/* Quick Action Overlay on Hover - Admin only */}
                            {userRole === 'admin' ? (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 rounded-lg shadow-sm border border-slate-200 p-0.5">
                                <button
                                  title="Edit / Relocate Slot (Admin)"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectEntry(entryAtSlot);
                                  }}
                                  className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  title="Find Substitute Teacher (Admin)"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFindSubstitute(entryAtSlot);
                                  }}
                                  className="p-1 text-slate-500 hover:text-amber-600 rounded hover:bg-amber-50 cursor-pointer"
                                >
                                  <UserPlus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 rounded-md px-1.5 py-0.5 shadow-xs border border-slate-200 text-[10px] text-slate-500">
                                <Eye className="w-3 h-3 text-blue-500" />
                                <span>Details</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Empty Slot
                    if (userRole === 'admin') {
                      return (
                        <td
                          key={`${day}-${slotIndex}`}
                          onClick={() => onEmptySlotClick(day, slotIndex)}
                          className="p-1.5 border-r border-slate-200 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                        >
                          <div className="h-24 rounded-xl border border-dashed border-slate-200 group-hover:border-blue-300 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all">
                            <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100 flex items-center gap-1">
                              + Add
                            </span>
                          </div>
                        </td>
                      );
                    }

                    // Non-admin (faculty or student): Empty slot is static and non-interactive
                    return (
                      <td
                        key={`${day}-${slotIndex}`}
                        className="p-1.5 border-r border-slate-200 bg-slate-50/30 select-none cursor-default"
                      >
                        <div className="h-24 rounded-xl border border-dashed border-slate-200/60 flex items-center justify-center text-slate-300">
                          <span className="text-[10px] text-slate-300/80 font-medium">Free Slot</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
