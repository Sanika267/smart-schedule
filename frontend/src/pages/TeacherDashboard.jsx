import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Timetable from '../components/Timetable';
import {
  DUMMY_TIMETABLE,
  DEPARTMENT_INFO,
  DIVISIONS_INFO,
  DAYS
} from '../data/dummyTimetable';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Layers,
  CalendarDays
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedDivision, setSelectedDivision] = useState('SE1');
  const [selectedDay, setSelectedDay] = useState('All');

  // Teacher stats / summary
  const teacherDivision = DIVISIONS_INFO[selectedDivision];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Teacher Welcome Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">

          {/* Subtle blue background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">

            <div>
              <div className="flex items-center gap-2 mb-2">

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Faculty Portal
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  Department of {DEPARTMENT_INFO.name}
                </span>

              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {user?.name || 'Faculty Member'}
              </h1>

              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                View teaching schedules across Computer Engineering divisions
                (SE1, SE2, SE3, TE1, TE2).
              </p>
            </div>

            {/* Division Info Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {selectedDivision}
              </div>

              <div className="text-xs">

                <div className="font-bold text-slate-900">
                  {teacherDivision.title}
                </div>

                <div className="text-slate-500">
                  Class Room:{' '}
                  <span className="font-mono text-slate-700">
                    {teacherDivision.room}
                  </span>
                </div>

                <div className="text-slate-500">
                  Class Teacher:{' '}
                  <span className="text-slate-700">
                    {teacherDivision.classTeacher}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Filter Controls & Timetable */}
        <div className="space-y-4">

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">

            {/* Division Selector */}
            <div className="flex items-center gap-2 flex-wrap">

              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Select Division:
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">

                {DEPARTMENT_INFO.divisions.map((div) => (
                  <button
                    key={div}
                    onClick={() => setSelectedDivision(div)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedDivision === div
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-blue-600 hover:bg-white'
                    }`}
                  >
                    {div}
                  </button>
                ))}

              </div>
            </div>

            {/* Day Filter */}
            <div className="flex items-center gap-2 flex-wrap">

              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Select Day:
              </span>

              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              >
                <option value="All">
                  All Days (Monday - Saturday)
                </option>

                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

            </div>
          </div>

          {/* Timetable */}
          <Timetable
            timetableData={DUMMY_TIMETABLE}
            selectedDivision={selectedDivision}
            selectedDay={selectedDay}
          />

        </div>
      </main>
    </div>
  );
}