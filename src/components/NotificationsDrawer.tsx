import React from 'react';
import { TimetableNotification } from '../types/timetable';
import { Bell, CheckCheck, Clock, UserCheck, X, AlertTriangle, Calendar, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  notifications: TimetableNotification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<Props> = ({
  isOpen,
  notifications,
  onClose,
  onMarkAllAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div id="notifications-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Notifications & Alerts</h3>
              <p className="text-[11px] text-slate-500">Live timetable updates dispatched to faculty & students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {notifications.filter((n) => !n.read).length} Unread
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-slate-700 text-[11px]"
            >
              Clear
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 opacity-40" />
              <p>No notifications yet.</p>
              <p className="text-[11px] text-slate-400">
                Any timetable generation, manual edit, or substitute assignment will log an alert here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  item.read ? 'bg-slate-50/70 border-slate-200 text-slate-600' : 'bg-white border-blue-200 shadow-xs text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {item.type === 'substitution' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                    {item.type === 'full_generation' && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
                    {item.type === 'time_change' && <Clock className="w-3.5 h-3.5 text-purple-600" />}
                    {item.type === 'clash_detected' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                    <span className="text-xs">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-600">{item.message}</p>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    Audience: {item.targetRole}
                  </span>
                  {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
