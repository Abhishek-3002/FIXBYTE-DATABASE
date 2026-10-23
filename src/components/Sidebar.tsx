/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  Server,
  Database,
  Users,
  AlertTriangle,
  FileText,
  Shield,
  Layers,
  LogOut,
  Sliders,
} from 'lucide-react';
import { Employee } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentEmployee: Employee;
  onOpenAuth: () => void;
  activeAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentEmployee,
  onOpenAuth,
  activeAlertCount,
}) => {
  const navItems = [
    {
      id: 'custom-tracking',
      label: 'Live Tracking Studio',
      icon: Activity,
      badge: 'LIVE',
    },
    {
      id: 'infrastructure',
      label: 'Fleet & Servers',
      icon: Server,
    },
    {
      id: 'databases',
      label: 'Database Clusters',
      icon: Database,
    },
    {
      id: 'access-control',
      label: 'Employee Access & RBAC',
      icon: Users,
    },
    {
      id: 'incidents',
      label: 'Active Alarms',
      icon: AlertTriangle,
      alertCount: activeAlertCount,
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-950">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>FixByte</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400">Database & Server Ops</p>
          </div>
        </div>
      </div>

      {/* Live System Indicator */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Cluster Prober</span>
        </div>
        <span className="text-slate-400 font-mono text-[11px] tabular-nums">1.2s Poll</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  {item.badge}
                </span>
              )}
              {item.alertCount !== undefined && item.alertCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {item.alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Current Operator Profile Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={currentEmployee.avatar}
                  alt={currentEmployee.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xs font-semibold text-slate-300">
                  {currentEmployee.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {currentEmployee.name}
                </div>
                <div className="text-[11px] text-cyan-400 font-mono truncate">
                  {currentEmployee.role.replace('_', ' ')}
                </div>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              title="Switch Employee or Log Out"
              aria-label="Switch operator"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-1 text-[11px] font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors text-center border border-slate-800"
          >
            Switch Role / Access Gate
          </button>
        </div>
      </div>
    </aside>
  );
};
