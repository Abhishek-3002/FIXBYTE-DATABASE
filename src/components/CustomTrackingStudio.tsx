/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Sliders,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Database,
  Server,
  Zap,
  Download,
  Terminal,
  Settings2,
  Bell,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';
import { CustomTracker, ServerNode, Employee, HealthStatus } from '../types';
import { SparklineChart } from './SparklineChart';
import { formatMetricValue, hasPermission } from '../utils/telemetry';

interface CustomTrackingStudioProps {
  trackers: CustomTracker[];
  nodes: ServerNode[];
  currentEmployee: Employee;
  onOpenAddModal: () => void;
  onEditTracker: (tracker: CustomTracker) => void;
  onDeleteTracker: (trackerId: string) => void;
  onToggleTracker: (trackerId: string) => void;
  onSimulateTrackerSpike: (trackerId: string) => void;
  onExecuteTestQuery: (query: string, nodeId: string) => { latencyMs: number; status: string; rows: number };
  onExportTelemetry: () => void;
}

export const CustomTrackingStudio: React.FC<CustomTrackingStudioProps> = ({
  trackers,
  nodes,
  currentEmployee,
  onOpenAddModal,
  onEditTracker,
  onDeleteTracker,
  onToggleTracker,
  onSimulateTrackerSpike,
  onExecuteTestQuery,
  onExportTelemetry,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [testQueryText, setTestQueryText] = useState("EXPLAIN ANALYZE SELECT * FROM fixbyte_transactions WHERE status = 'COMPLETED' LIMIT 100;");
  const [selectedNodeForQuery, setSelectedNodeForQuery] = useState('node-pg-primary');
  const [queryResult, setQueryResult] = useState<{ latencyMs: number; status: string; rows: number } | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);

  const canCustomize = hasPermission(currentEmployee.role, 'CUSTOMIZE_TRACKING');

  // Filter trackers
  const filteredTrackers = trackers.filter((tracker) => {
    const matchesSearch =
      tracker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tracker.targetNodeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'DATABASE') {
      return tracker.metricType.includes('QUERY') || tracker.metricType.includes('REPLICATION') || tracker.metricType.includes('CACHE') || tracker.targetNodeName.includes('db') || tracker.targetNodeName.includes('cache');
    }
    if (filterType === 'SERVER') {
      return tracker.metricType.includes('CPU') || tracker.metricType.includes('RAM') || tracker.metricType.includes('ERROR') || tracker.targetNodeName.includes('srv') || tracker.targetNodeName.includes('gateway');
    }
    if (filterType === 'WARNING') {
      return tracker.status === 'WARNING' || tracker.status === 'CRITICAL';
    }
    return true;
  });

  const handleRunQuery = () => {
    setIsExecutingQuery(true);
    setTimeout(() => {
      const res = onExecuteTestQuery(testQueryText, selectedNodeForQuery);
      setQueryResult(res);
      setIsExecutingQuery(false);
    }, 400);
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            NOMINAL
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Studio Header & Value Proposition */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
                FixByte Customization Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {trackers.length} Custom Trackers Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Live Database & Server Telemetry Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Create, customize, and calibrate real-time telemetry meters for any database cluster, server instance, or global gateway. Set custom thresholds, automated alarm actions, and update frequencies.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onExportTelemetry}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Telemetry</span>
            </button>

            <button
              onClick={onOpenAddModal}
              disabled={!canCustomize}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Custom Tracker</span>
            </button>
          </div>
        </div>

        {/* Live Query Latency Tester Console */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Database Query & Probe Latency Sandbox</span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Execute real-time query probe against target node)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-56 shrink-0">
              <select
                value={selectedNodeForQuery}
                onChange={(e) => setSelectedNodeForQuery(e.target.value)}
                aria-label="Target Node for Query Probe"
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={testQueryText}
                onChange={(e) => setTestQueryText(e.target.value)}
                placeholder="Enter SQL or probe command to test latency response..."
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              onClick={handleRunQuery}
              disabled={isExecutingQuery}
              className="h-10 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400" />
              <span>{isExecutingQuery ? 'Probing...' : 'Run Probe'}</span>
            </button>
          </div>

          {queryResult && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono gap-2 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">✓ {queryResult.status}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">
                  Round-Trip Latency: <strong className="text-cyan-300">{queryResult.latencyMs} ms</strong>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">Rows Scanned: {queryResult.rows}</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Feed directly piped to Live Tracker ID: <span className="text-slate-300">track-01</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Trackers' },
            { id: 'DATABASE', label: 'Database Trackers' },
            { id: 'SERVER', label: 'Server & Host' },
            { id: 'WARNING', label: 'Active Alerts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === tab.id
                  ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom trackers or nodes..."
            className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Trackers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTrackers.map((tracker) => {
          const isEnabled = tracker.enabled;
          const isWarning = tracker.status === 'WARNING' || tracker.status === 'CRITICAL';

          return (
            <div
              key={tracker.id}
              className={`rounded-xl bg-slate-900 border transition-all ${
                isWarning
                  ? 'border-amber-500/50 shadow-md shadow-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              } p-4 flex flex-col justify-between`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400/90 truncate mb-1">
                      {tracker.targetNodeName.includes('db') || tracker.targetNodeName.includes('cache') ? (
                        <Database className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Server className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{tracker.targetNodeName}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate" title={tracker.title}>
                      {tracker.title}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {getStatusBadge(tracker.status)}
                  </div>
                </div>

                {/* Big Metric Display & Threshold Reference */}
                <div className="my-3 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                      {tracker.currentValue.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{tracker.unit}</span>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>
                      <span className="text-amber-400">Warn:</span> ≥{tracker.warningThreshold} {tracker.unit}
                    </div>
                    <div>
                      <span className="text-rose-400">Crit:</span> ≥{tracker.criticalThreshold} {tracker.unit}
                    </div>
                  </div>
                </div>

                {/* Live Sparkline Graph */}
                <div className="my-2 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
                  <SparklineChart
                    data={tracker.history}
                    warningThreshold={tracker.warningThreshold}
                    criticalThreshold={tracker.criticalThreshold}
                    unit={tracker.unit}
                    status={tracker.status}
                    height={75}
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                    <span>-60s</span>
                    <span className="text-cyan-400/80">Live {tracker.refreshIntervalSec}s poll</span>
                    <span>Now</span>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Alert Action:</span>
                    <span className="text-slate-300 font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                      {tracker.alertAction} → {tracker.notificationTarget}
                    </span>
                  </div>
                  {tracker.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1" title={tracker.notes}>
                      "{tracker.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSimulateTrackerSpike(tracker.id)}
                    title="Simulate sudden traffic spike on this tracker"
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-mono flex items-center gap-1 border border-slate-700 transition-colors"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Spike</span>
                  </button>

                  <button
                    onClick={() => onToggleTracker(tracker.id)}
                    title={isEnabled ? 'Pause Tracking' : 'Resume Tracking'}
                    className={`p-1.5 rounded text-xs border transition-colors ${
                      isEnabled
                        ? 'text-emerald-400 bg-slate-800 border-slate-700 hover:bg-slate-700'
                        : 'text-amber-400 bg-amber-950/30 border-amber-800'
                    }`}
                  >
                    {isEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditTracker(tracker)}
                    disabled={!canCustomize}
                    title="Customize thresholds and settings"
                    className="p-1.5 rounded text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-40"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteTracker(tracker.id)}
                    disabled={!canCustomize}
                    title="Delete Tracker"
                    className="p-1.5 rounded text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-800 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTrackers.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800">
          <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No custom trackers found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No tracker matched "${searchQuery}". Try clearing the search or adding a new tracker.`
              : 'Add your first customizable database or server tracker to start real-time monitoring.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Tracker</span>
          </button>
        </div>
      )}
    </div>
  );
};
