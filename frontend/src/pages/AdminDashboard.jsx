import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Timetable from '../components/Timetable';
import {
  DUMMY_TIMETABLE,
  DEPARTMENT_INFO,
  DIVISIONS_INFO,
  DAYS
} from '../data/dummyTimetable';

import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  CalendarDays,
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const [selectedDivision, setSelectedDivision] = useState('SE1');
  const [selectedDay, setSelectedDay] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [showGenModal, setShowGenModal] = useState(false);
  const [timetableData, setTimetableData] = useState(DUMMY_TIMETABLE);
  const [lastGeneratedTime, setLastGeneratedTime] =
    useState('Today at 09:30 AM');

  const steps = [
    'Analyzing department faculty workload & course credits...',
    'Validating room availability (CR-201, CR-202, CR-203, CR-304, CR-305, Labs)...',
    'Running genetic conflict prevention algorithm (Zero Teacher Clashes)...',
    'Finalizing optimized timetable matrices for SE1, SE2, SE3, TE1, and TE2...'
  ];

  const handleGenerateTimetable = () => {
    setShowGenModal(true);
    setIsGenerating(true);
    setGenerationStep(0);

    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsGenerating(false);

          setLastGeneratedTime(
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          );

          return prev;
        }
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">

                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Admin Control Panel
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  Dept Code: {DEPARTMENT_INFO.code}
                </span>

              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {DEPARTMENT_INFO.name} Department
              </h1>

              <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-2xl">
                Manage divisions, view master schedules, and trigger automatic
                timetable generation.
              </p>

            </div>

            {/* Generate Button */}

            <button
              onClick={handleGenerateTimetable}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Timetable</span>
            </button>

          </div>


          {/* =========================================
              DIVISION CARDS
          ========================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-7 pt-6 border-t border-slate-100">

            {DEPARTMENT_INFO.divisions.map((divKey) => {

              const div = DIVISIONS_INFO[divKey];
              const isSelected = selectedDivision === divKey;

              return (
                <button
                  key={divKey}
                  onClick={() => setSelectedDivision(divKey)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        Division
                      </span>

                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                        {div.title}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1">
                        {div.classTeacher} • {div.room}
                      </p>

                    </div>

                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {divKey}
                    </div>

                  </div>

                </button>
              );
            })}

          </div>

        </div>


        {/* =========================================
            CLASH PREVENTION BANNER
        ========================================= */}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">

          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />

          <div className="text-xs space-y-1">

            <span className="font-bold text-slate-800">
              Automated Clash Prevention Active
            </span>

            <p className="text-slate-600 leading-relaxed">
              The algorithm guarantees zero teacher double-booking across
              divisions. For example, if Prof. S. R. Kulkarni is assigned to
              SE1 from 10:00–11:00, the system automatically prevents
              scheduling them for TE1 at the exact same slot.
            </p>

          </div>

        </div>


        {/* =========================================
            FILTERS
        ========================================= */}

        <div className="space-y-4">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">

            {/* Division Selector */}

            <div className="flex items-center gap-2 flex-wrap">

              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Select Division:
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">

                {DEPARTMENT_INFO.divisions.map((div) => (

                  <button
                    key={div}
                    onClick={() => setSelectedDivision(div)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedDivision === div
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                    }`}
                  >
                    {div}
                  </button>

                ))}

              </div>

            </div>


            {/* Day Filter */}

            <div className="flex items-center gap-2">

              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                Day Filter:
              </span>

              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Days (Mon-Sat)</option>

                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}

              </select>

            </div>


            {/* Last Generated */}

            <div className="text-xs text-slate-500 flex items-center gap-1.5">

              <Eye className="w-3.5 h-3.5 text-blue-600" />

              <span>
                Last Generated:{' '}
                <strong className="text-slate-800">
                  {lastGeneratedTime}
                </strong>
              </span>

            </div>

          </div>


          {/* =========================================
              TIMETABLE
          ========================================= */}

          <Timetable
            timetableData={timetableData}
            selectedDivision={selectedDivision}
            selectedDay={selectedDay}
          />

        </div>

      </main>


      {/* =========================================
          GENERATION MODAL
      ========================================= */}

      {showGenModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">

            {/* Modal Header */}

            <div className="text-center space-y-2">

              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mb-2">

                {isGenerating ? (
                  <RefreshCw className="w-7 h-7 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                )}

              </div>

              <h3 className="text-xl font-bold text-slate-900">

                {isGenerating
                  ? 'Generating Automatic Timetable'
                  : 'Timetable Generated Successfully!'}

              </h3>

              <p className="text-xs text-slate-500">

                {isGenerating
                  ? 'Constraint satisfaction engine is organizing conflict-free schedules.'
                  : 'Master schedules for SE1, SE2, SE3, TE1, and TE2 are ready with zero teacher clashes.'}

              </p>

            </div>


            {/* Progress Steps */}

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">

              {steps.map((step, idx) => {

                const isDone = idx < generationStep || !isGenerating;
                const isCurrent =
                  idx === generationStep && isGenerating;

                return (

                  <div
                    key={idx}
                    className="flex items-start gap-2.5"
                  >

                    {isDone ? (

                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />

                    ) : isCurrent ? (

                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />

                    ) : (

                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />

                    )}

                    <span
                      className={
                        isDone
                          ? 'text-slate-700 font-medium'
                          : isCurrent
                          ? 'text-blue-700 font-semibold'
                          : 'text-slate-400'
                      }
                    >
                      {step}
                    </span>

                  </div>

                );
              })}

            </div>


            {/* Close */}

            {!isGenerating && (

              <button
                onClick={() => setShowGenModal(false)}
                className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Close & View Updated Timetables
              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}