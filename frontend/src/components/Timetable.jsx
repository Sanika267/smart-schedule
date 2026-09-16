import React from 'react';
import { TIME_SLOTS, DAYS } from '../data/dummyTimetable';
import {
  BookOpen,
  User,
  MapPin,
  Coffee,
  FlaskConical,
  Award
} from 'lucide-react';

export default function Timetable({
  timetableData,
  selectedDivision = 'SE1',
  selectedDay = 'All'
}) {
  if (!timetableData || !timetableData[selectedDivision]) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <p className="text-slate-500 text-sm">
          No timetable data available for Division {selectedDivision}.
        </p>
      </div>
    );
  }

  const divData = timetableData[selectedDivision];

  const displayedDays =
    selectedDay === 'All' ? DAYS : [selectedDay];

  /* Find lecture for a given day and time */
  const getLecture = (day, timeSlot) => {
    const daySchedule = divData[day];

    if (!daySchedule) return null;

    return daySchedule.find(
      (item) => item.time === timeSlot
    );
  };

  /* =========================================
     BADGES
     ========================================= */

  const getLectureBadge = (type) => {
    switch (type) {

      case 'Lab':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
            <FlaskConical className="w-2.5 h-2.5" />
            LAB
          </span>
        );

      case 'Break':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
            <Coffee className="w-2.5 h-2.5" />
            BREAK
          </span>
        );

      case 'Activity':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Award className="w-2.5 h-2.5" />
            ACTIVITY
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            <BookOpen className="w-2.5 h-2.5" />
            LEC
          </span>
        );
    }
  };


  /* =========================================
     LECTURE CARD STYLE
     ========================================= */

  const getLectureCardStyle = (type) => {

    switch (type) {

      case 'Lab':
        return `
          bg-purple-50
          border-purple-200
          hover:border-purple-300
          text-slate-800
        `;

      case 'Break':
        return `
          bg-amber-50
          border-amber-200
          text-amber-800
          justify-center
          text-center
        `;

      case 'Activity':
        return `
          bg-emerald-50
          border-emerald-200
          hover:border-emerald-300
          text-slate-800
        `;

      default:
        return `
          bg-blue-50
          border-blue-200
          hover:border-blue-300
          hover:bg-blue-100/70
          text-slate-800
        `;
    }
  };


  return (

    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* =========================================
          TABLE HEADER
          ========================================= */}

      <div className="px-5 sm:px-6 py-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">

        <div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">

            <span>
              Division {selectedDivision} Timetable
            </span>

            <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
              {displayedDays.length === 1
                ? `Day: ${displayedDays[0]}`
                : 'Weekly Overview'}
            </span>

          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Computer Engineering • Academic Schedule
          </p>

        </div>


        {/* =========================================
            LEGEND
            ========================================= */}

        <div className="flex flex-wrap items-center gap-3 text-xs">

          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Lecture
          </span>

          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            Practical Lab
          </span>

          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Activity/Seminar
          </span>

        </div>

      </div>


      {/* =========================================
          TABLE
          ========================================= */}

      <div className="overflow-x-auto">

        <table className="w-full text-left border-collapse min-w-[800px]">

          {/* TABLE HEAD */}

          <thead>

            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">

              <th className="py-3.5 px-4 w-36 bg-slate-50 sticky left-0 z-10 border-r border-slate-200">
                Time
              </th>

              {displayedDays.map((day) => (

                <th
                  key={day}
                  className="py-3.5 px-4 border-r border-slate-200 min-w-[170px]"
                >
                  {day}
                </th>

              ))}

            </tr>

          </thead>


          {/* TABLE BODY */}

          <tbody className="text-xs">

            {TIME_SLOTS.map((timeSlot) => (

              <tr
                key={timeSlot}
                className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors"
              >

                {/* TIME */}

                <td className="py-3 px-4 font-semibold text-slate-600 bg-white sticky left-0 z-10 border-r border-slate-200 whitespace-nowrap">

                  {timeSlot}

                </td>


                {/* DAY COLUMNS */}

                {displayedDays.map((day) => {

                  const lecture = getLecture(day, timeSlot);


                  /* FREE SLOT */

                  if (!lecture) {

                    return (

                      <td
                        key={day}
                        className="p-2 border-r border-slate-100 text-slate-400 text-center italic"
                      >
                        Free Slot
                      </td>

                    );

                  }


                  /* BREAK */

                  if (lecture.type === 'Break') {

                    return (

                      <td
                        key={day}
                        className="p-2 border-r border-slate-100"
                      >

                        <div className="h-full min-h-[72px] p-2.5 rounded-xl border flex flex-col items-center justify-center bg-amber-50 border-amber-200 text-amber-800">

                          {getLectureBadge('Break')}

                          <span className="text-xs font-semibold mt-1">
                            {lecture.subject}
                          </span>

                        </div>

                      </td>

                    );

                  }


                  /* NORMAL LECTURE / LAB / ACTIVITY */

                  return (

                    <td
                      key={day}
                      className="p-2 border-r border-slate-100"
                    >

                      <div
                        className={`
                          h-full
                          min-h-[78px]
                          p-2.5
                          rounded-xl
                          border
                          transition-all
                          duration-200
                          flex
                          flex-col
                          justify-between
                          gap-1.5
                          shadow-sm
                          ${getLectureCardStyle(lecture.type)}
                        `}
                      >

                        {/* SUBJECT + BADGE */}

                        <div className="flex items-start justify-between gap-1">

                          <span className="font-bold text-xs leading-snug line-clamp-2">
                            {lecture.subject}
                          </span>

                          {getLectureBadge(lecture.type)}

                        </div>


                        {/* TEACHER + ROOM */}

                        <div className="space-y-0.5 text-[11px] mt-1">

                          {lecture.teacher &&
                            lecture.teacher !== '-' && (

                              <div className="flex items-center gap-1 text-slate-600">

                                <User className="w-3 h-3 text-blue-600 shrink-0" />

                                <span className="truncate font-medium">
                                  {lecture.teacher}
                                </span>

                              </div>

                            )}


                          {lecture.classroom &&
                            lecture.classroom !== '-' && (

                              <div className="flex items-center gap-1 text-slate-500">

                                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />

                                <span className="truncate font-mono">
                                  {lecture.classroom}
                                </span>

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