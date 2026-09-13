import React from 'react';
import { TIME_SLOTS, DAYS } from '../data/dummyTimetable';
import { BookOpen, User, MapPin, Coffee, FlaskConical, Award } from 'lucide-react';

export default function Timetable({ timetableData, selectedDivision = 'SE', selectedDay = 'All' }) {
  if (!timetableData || !timetableData[selectedDivision]) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 text-center">
        <p className="text-slate-400 text-sm">No timetable data available for Division {selectedDivision}.</p>
      </div>
    );
  }

  const divData = timetableData[selectedDivision];
  const displayedDays = selectedDay === 'All' ? DAYS : [selectedDay];

  // Helper function to find class for a given day and time slot
  const getLecture = (day, timeSlot) => {
    const daySchedule = divData[day];
    if (!daySchedule) return null;
    return daySchedule.find((item) => item.time === timeSlot);
  };

  const getLectureBadge = (type) => {
    switch (type) {
      case 'Lab':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <FlaskConical className="w-2.5 h-2.5" /> LAB
          </span>
        );
      case 'Break':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Coffee className="w-2.5 h-2.5" /> BREAK
          </span>
        );
      case 'Activity':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Award className="w-2.5 h-2.5" /> ACTIVITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <BookOpen className="w-2.5 h-2.5" /> LEC
          </span>
        );
    }
  };

  const getLectureCardStyle = (type) => {
    switch (type) {
      case 'Lab':
        return 'bg-purple-950/40 border-purple-800/40 hover:border-purple-600/60 text-purple-100';
      case 'Break':
        return 'bg-amber-950/20 border-amber-800/30 text-amber-200/80 justify-center text-center';
      case 'Activity':
        return 'bg-emerald-950/30 border-emerald-800/40 hover:border-emerald-600/60 text-emerald-100';
      default:
        return 'bg-slate-800/70 border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-100';
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table header info */}
      <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Division {selectedDivision} Timetable</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
              {displayedDays.length === 1 ? `Day: ${displayedDays[0]}` : 'Weekly Overview'}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Computer Engineering • Academic Schedule
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Lecture
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Practical Lab
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Activity/Seminar
          </span>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700/80 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-36 bg-slate-800/90 sticky left-0 z-10 border-r border-slate-700/50">
                Time
              </th>
              {displayedDays.map((day) => (
                <th key={day} className="py-3.5 px-4 border-r border-slate-700/50 min-w-[170px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/70 text-xs">
            {TIME_SLOTS.map((timeSlot) => (
              <tr key={timeSlot} className="hover:bg-slate-800/20 transition-colors">
                {/* Time Column */}
                <td className="py-3 px-4 font-semibold text-slate-300 bg-slate-900/90 sticky left-0 z-10 border-r border-slate-800 whitespace-nowrap">
                  {timeSlot}
                </td>

                {/* Day Columns */}
                {displayedDays.map((day) => {
                  const lecture = getLecture(day, timeSlot);

                  if (!lecture) {
                    return (
                      <td key={day} className="p-2 border-r border-slate-800/50 text-slate-600 text-center italic">
                        Free Slot
                      </td>
                    );
                  }

                  if (lecture.type === 'Break') {
                    return (
                      <td key={day} className="p-2 border-r border-slate-800/50">
                        <div className="h-full min-h-[72px] p-2.5 rounded-xl border flex flex-col items-center justify-center bg-amber-950/20 border-amber-800/30 text-amber-300/80">
                          {getLectureBadge('Break')}
                          <span className="text-xs font-semibold mt-1">{lecture.subject}</span>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={day} className="p-2 border-r border-slate-800/50">
                      <div
                        className={`h-full min-h-[78px] p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-1.5 shadow-sm ${getLectureCardStyle(
                          lecture.type
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs leading-snug line-clamp-2">
                            {lecture.subject}
                          </span>
                          {getLectureBadge(lecture.type)}
                        </div>

                        <div className="space-y-0.5 text-[11px] text-slate-300 mt-1">
                          {lecture.teacher && lecture.teacher !== '-' && (
                            <div className="flex items-center gap-1 text-slate-300">
                              <User className="w-3 h-3 text-indigo-400 shrink-0" />
                              <span className="truncate font-medium">{lecture.teacher}</span>
                            </div>
                          )}

                          {lecture.classroom && lecture.classroom !== '-' && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate font-mono">{lecture.classroom}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
