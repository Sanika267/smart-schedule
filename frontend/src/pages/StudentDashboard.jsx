import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Timetable from '../components/Timetable';
import {
  DEPARTMENT_INFO,
  DIVISIONS_INFO,
  DAYS
} from '../data/dummyTimetable';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Layers,
  CalendarDays,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [selectedDivision, setSelectedDivision] = useState('SE1');
  const [selectedDay, setSelectedDay] = useState('All');
  const [timetableData, setTimetableData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeDivInfo = DIVISIONS_INFO[selectedDivision];

  const fetchTimetable = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/timetable');
      setTimetableData(response.timetable);
    } catch (err) {
      setError(err.message || 'Failed to load timetable');
      console.error('Timetable fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Student Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">

          {/* Subtle blue background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">

            <div>
              <div className="flex items-center gap-2 mb-2">

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student Portal
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  Department of {DEPARTMENT_INFO.name}
                </span>

              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {user?.name || 'Student'}
              </h1>

              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Check your weekly class schedule, assigned professors,
                and classroom locations.
              </p>
            </div>

            {/* Selected Division Details */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                {selectedDivision}
              </div>

              <div className="text-xs">

                <div className="font-bold text-slate-900 text-sm">
                  {activeDivInfo.title}
                </div>

                <div className="text-slate-500 mt-0.5">
                  Class Room:{' '}
                  <span className="font-mono text-blue-700">
                    {activeDivInfo.room}
                  </span>
                </div>

                <div className="text-slate-500">
                  Class In-charge:{' '}
                  <span className="text-slate-700">
                    {activeDivInfo.classTeacher}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Filter Controls & Timetable Section */}
        <div className="space-y-4">

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">

            {/* Division Selection */}
            <div className="flex items-center gap-2 flex-wrap">

              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Select Year / Division:
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">

                {DEPARTMENT_INFO.divisions.map((div) => (
                  <button
                    key={div}
                    onClick={() => setSelectedDivision(div)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                Filter Day:
              </span>

              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              >
                <option value="All">
                  Full Week (Mon - Sat)
                </option>

                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}

              </select>

            </div>
          </div>

          {/* Timetable - Read Only Student View */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm text-slate-600">Loading your timetable...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-red-800">Failed to Load Timetable</span>
                <p className="text-red-600 leading-relaxed">{error}</p>
                <button
                  onClick={fetchTimetable}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <Timetable
              timetableData={timetableData}
              selectedDivision={selectedDivision}
              selectedDay={selectedDay}
            />
          )}

        </div>
      </main>
    </div>
  );
}