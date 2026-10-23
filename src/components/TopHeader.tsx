/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Pause,
  Zap,
  Plus,
  RefreshCw,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { Employee } from '../types';

interface TopHeaderProps {
  currentTab: string;
  isLiveTrackingActive: boolean;
  onToggleLiveTracking: () => void;
  refreshRateSec: number;
  onChangeRefreshRate: (rate: number) => void;
  isSimulatingLoad: boolean;
  onToggleSimulateLoad: () => void;
  onOpenAddTrackerModal: () => void;
  onOpenAddNodeModal: () => void;
  currentEmployee: Employee;
  activeAlertCount: number;
  onSelectTab: (tab: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  isLiveTrackingActive,
  onToggleLiveTracking,
  refreshRateSec,
  onChangeRefreshRate,
  isSimulatingLoad,
  onToggleSimulateLoad,
  onOpenAddTrackerModal,
  onOpenAddNodeModal,
  currentEmployee,
  activeAlertCount,
  onSelectTab,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'custom-tracking':
        return 'Live Customizable Tracking Studio';
      case 'infrastructure':
        return 'Server Fleet & Compute Nodes';
      case 'databases':
        return 'Database Reliability & Query Cluster';
      case 'access-control':
        return 'Employee Access Control & RBAC Matrix';
      case 'incidents':
        return 'Active Telemetry Incidents & Alarms';
      case 'audit-trail':
        return 'Security Audit Trail & Execution Logs';
      default:
        return 'FixByte Operations Console';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between gap-4 z-10 shrink-0">
      {/* Zone 1: Breadcrumb and Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-xs text-slate-400 font-mono hidden sm:inline">
          <span>FixByte Internal</span>
          <span className="mx-1.5 text-slate-600">/</span>
        </div>
        <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
          {getTabTitle()}
        </h1>
      </div>

      {/* Zone 2: Telemetry Controls & Live Simulation */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Polling Interval Controls */}
        <div className="hidden lg:flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 px-2 font-mono">Stream:</span>
          {[1, 2, 5].map((rate) => (
            <button
              key={rate}
              onClick={() => onChangeRefreshRate(rate)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium transition-colors ${
                refreshRateSec === rate
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}s
            </button>
          ))}
          <button
            onClick={onToggleLiveTracking}
            title={isLiveTrackingActive ? 'Pause Telemetry' : 'Resume Telemetry'}
            className={`ml-1 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
              isLiveTrackingActive
                ? 'text-emerald-400 hover:bg-slate-800'
                : 'text-amber-400 bg-amber-950/40 border border-amber-800/60'
            }`}
          >
            {isLiveTrackingActive ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Live</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Paused</span>
              </>
            )}
          </button>
        </div>

        {/* Load Spike Simulation Toggle */}
        <button
          onClick={onToggleSimulateLoad}
          title="Simulate high database query and CPU traffic spike to test live alarms"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
            isSimulatingLoad
              ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isSimulatingLoad ? 'text-rose-400 fill-rose-400' : 'text-amber-400'}`} />
          <span className="hidden sm:inline">
            {isSimulatingLoad ? 'Simulating Spike...' : 'Simulate Spike'}
          </span>
        </button>

        {/* Alarms quick bell */}
        <button
          onClick={() => onSelectTab('incidents')}
          title="View Active Incidents"
          className="relative p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2">
          {currentTab === 'infrastructure' ? (
            <button
              onClick={onOpenAddNodeModal}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Register Node</span>
            </button>
          ) : (
            <button
              onClick={onOpenAddTrackerModal}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Customize Tracker</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
