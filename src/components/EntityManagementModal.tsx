import React, { useState } from 'react';
import { Division, Room, Subject, Teacher } from '../types/timetable';
import {
  BookOpen,
  Building2,
  Check,
  GraduationCap,
  Plus,
  ToggleLeft,
  ToggleRight,
  User,
  Users,
  X,
  FlaskConical,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  teachers: Teacher[];
  subjects: Subject[];
  divisions: Division[];
  rooms: Room[];
  onClose: () => void;
  onToggleTeacherAvailability: (teacherId: string) => void;
}

export const EntityManagementModal: React.FC<Props> = ({
  isOpen,
  teachers,
  subjects,
  divisions,
  rooms,
  onClose,
  onToggleTeacherAvailability,
}) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'subjects' | 'divisions' | 'rooms'>('teachers');

  if (!isOpen) return null;

  return (
    <div id="entity-management-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Entity Management</h3>
              <p className="text-xs text-slate-500">
                Configure faculty constraints, subject hours, student divisions, and lab resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 text-xs font-semibold">
          {[
            { id: 'teachers', label: `Faculty (${teachers.length})`, icon: User },
            { id: 'subjects', label: `Curriculum / Subjects (${subjects.length})`, icon: BookOpen },
            { id: 'divisions', label: `Divisions (${divisions.length})`, icon: GraduationCap },
            { id: 'rooms', label: `Rooms & Labs (${rooms.length})`, icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'teachers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Manage faculty subject qualifications, max weekly workload, and leave status.</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teachers.map((t) => {
                  const qualifiedSubjects = subjects.filter((s) => t.qualifiedSubjectIds.includes(s.id));
                  const isAvailable = t.isAvailable !== false;
                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        isAvailable ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                          <p className="text-[11px] text-slate-500">{t.email} • {t.department}</p>
                        </div>
                        <button
                          onClick={() => onToggleTeacherAvailability(t.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {isAvailable ? 'Available' : 'On Leave'}
                        </button>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Max Weekly Hours:</span>
                          <span className="font-bold text-slate-800">{t.maxWeeklyHours} hrs/week</span>
                        </div>

                        {t.preferredDays && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Preferred Days:</span>
                            <span className="font-medium text-slate-700">{t.preferredDays.join(', ')}</span>
                          </div>
                        )}

                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-semibold">Qualified For:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {qualifiedSubjects.map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                              >
                                {s.code}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjects.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: s.color }}
                          className="w-3 h-3 rounded-full shrink-0"
                        ></span>
                        <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold text-[10px]">
                        {s.code}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Theory</span>
                        <span className="font-bold text-slate-800">{s.theoryHoursPerWeek} hrs/wk</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Practical Lab</span>
                        <span className="font-bold text-slate-800">{s.practicalHoursPerWeek} hrs/wk</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Lab Required</span>
                        <span className={`font-bold ${s.isLabRequired ? 'text-purple-600' : 'text-slate-400'}`}>
                          {s.isLabRequired ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'divisions' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {divisions.map((d) => {
                  const divSubjects = subjects.filter((s) => d.subjectIds.includes(s.id));
                  const defaultRoom = rooms.find((r) => r.id === d.defaultClassroomId);
                  return (
                    <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
                      <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                      <p className="text-slate-500 text-[11px]">{d.department} • Sem {d.semester}</p>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                        <p><strong>Strength:</strong> {d.studentCount} Students</p>
                        <p><strong>Default Hall:</strong> {defaultRoom?.name || 'Assigned per slot'}</p>
                        <div className="mt-2">
                          <span className="font-semibold text-slate-700">Curriculum ({divSubjects.length} subjects):</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {divSubjects.map((s) => (
                              <span key={s.id} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                                {s.code}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {rooms.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.type === 'lab'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.type === 'lab' ? 'Lab Facility' : 'Theory Classroom'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{r.building}</p>
                    <p className="text-slate-600 text-[11px]">Capacity: <strong>{r.capacity} seats</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Changes to faculty availability or hours update the CSP domain on the next generation.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
