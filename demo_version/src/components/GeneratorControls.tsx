import React, { useState } from 'react';
import { FeasibilityReport, GenerationStats, SolverConfig } from '../types/timetable';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileCode,
  Layers,
  Printer,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react';

interface Props {
  isGenerating: boolean;
  stats: GenerationStats | null;
  config: SolverConfig;
  onConfigChange: (config: SolverConfig) => void;
  onGenerate: () => void;
  onResetToDefault: () => void;
  onPrint: () => void;
  onOpenCoordinatorHub: () => void;
  onSaveToDataFile: () => void;
  lastSavedAt: string | null;
  hasGenerated: boolean;
  feasibility: FeasibilityReport;
  entityCounts: {
    subjects: number;
    teachers: number;
    rooms: number;
    divisions: number;
  };
}

export const GeneratorControls: React.FC<Props> = ({
  isGenerating,
  stats,
  config,
  onConfigChange,
  onGenerate,
  onResetToDefault,
  onPrint,
  onOpenCoordinatorHub,
  onSaveToDataFile,
  lastSavedAt,
  hasGenerated,
  feasibility,
  entityCounts,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div id="generator-controls-card" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Main Generate Button */}
          <button
            id="run-csp-generator-btn"
            disabled={isGenerating || !feasibility.isFeasible}
            onClick={onGenerate}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all cursor-pointer ${
              !feasibility.isFeasible
                ? 'bg-slate-400 cursor-not-allowed opacity-75'
                : isGenerating
                ? 'bg-blue-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
            }`}
            title={
              !feasibility.isFeasible
                ? 'Please resolve coordinator data issues before generating'
                : 'Runs CSP solver using active coordinator data'
            }
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Solving Constraints...' : hasGenerated ? 'Regenerate Timetable (CSP)' : 'Generate Timetable from Data'}
          </button>

          {/* Coordinator Data & Factors Hub */}
          <button
            id="open-coordinator-hub-btn"
            onClick={onOpenCoordinatorHub}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors cursor-pointer"
            title="Configure subjects, teachers for each sub, classrooms, labs, and divisions"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Configure College Data</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-200/80 text-blue-900 text-[10px]">
              {entityCounts.divisions} Divs
            </span>
          </button>

          {/* Save to Data File */}
          <button
            id="save-data-file-quick-btn"
            onClick={onSaveToDataFile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Save current academic inputs to persistent data file"
          >
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Save in Data File</span>
          </button>

          {/* Soft Constraints Toggle */}
          <button
            id="toggle-solver-config-btn"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Soft Constraints</span>
            {showConfig ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          <button
            onClick={onResetToDefault}
            title="Reset schedule"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Print / Export Action & Data Status */}
        <div className="flex items-center gap-2">
          {lastSavedAt && (
            <span className="hidden lg:inline text-[11px] text-slate-500 font-medium">
              Data File Saved: <strong>{lastSavedAt}</strong>
            </span>
          )}
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Grid</span>
          </button>
        </div>
      </div>

      {/* Feasibility Warning Banner (if any coordinator errors exist) */}
      {!feasibility.isFeasible && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Coordinator Action Needed:</strong> {feasibility.errors[0]?.description}
            </span>
          </div>
          <button
            onClick={onOpenCoordinatorHub}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Fix in Data Hub
          </button>
        </div>
      )}

      {/* Expandable Soft Constraint Weighting */}
      {showConfig && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 animate-in fade-in duration-150">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            Soft Constraint Optimization Parameters:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={config.minimizeGaps}
                onChange={(e) => onConfigChange({ ...config, minimizeGaps: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] font-medium">Minimize Schedule Gaps</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={config.spreadSubjectsEvenly}
                onChange={(e) => onConfigChange({ ...config, spreadSubjectsEvenly: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] font-medium">Spread Theory Across Days</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={config.balanceTeacherLoad}
                onChange={(e) => onConfigChange({ ...config, balanceTeacherLoad: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] font-medium">Balance Faculty Workload</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={config.respectTeacherPreferences}
                onChange={(e) =>
                  onConfigChange({ ...config, respectTeacherPreferences: e.target.checked })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] font-medium">Respect Preferred Days</span>
            </label>
          </div>
        </div>
      )}

      {/* Solver Metrics Display */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Hard Constraints</span>
              <p className="font-bold text-slate-900 text-sm">
                {stats.hardConstraintScore}% Satisfied (0 Clashes)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Optimization Score</span>
              <p className="font-bold text-slate-900 text-sm">{stats.softConstraintScore}/100 Pts</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-purple-50/60 rounded-xl border border-purple-100">
            <Clock className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">Solve Execution</span>
              <p className="font-bold text-slate-900 text-sm">{stats.durationMs} ms</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <Layers className="w-5 h-5 text-slate-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Scheduled Units</span>
              <p className="font-bold text-slate-900 text-sm">
                {stats.totalAssignments} Sessions ({stats.backtrackCount} Backtracks)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
