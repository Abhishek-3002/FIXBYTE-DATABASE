/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Server,
  Database,
  RotateCw,
  ArrowRightLeft,
  Cpu,
  HardDrive,
  Activity,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Radio,
  FileCode,
} from 'lucide-react';
import { ServerNode, Employee, HealthStatus } from '../types';
import { hasPermission } from '../utils/telemetry';

interface InfrastructureOverviewProps {
  nodes: ServerNode[];
  currentEmployee: Employee;
  onRestartNode: (nodeId: string) => void;
  onFailoverNode: (nodeId: string) => void;
  onOpenAddNodeModal: () => void;
}

export const InfrastructureOverview: React.FC<InfrastructureOverviewProps> = ({
  nodes,
  currentEmployee,
  onRestartNode,
  onFailoverNode,
  onOpenAddNodeModal,
}) => {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedNodeLogs, setSelectedNodeLogs] = useState<ServerNode | null>(null);

  const canRestart = hasPermission(currentEmployee.role, 'RESTART_SERVICES');
  const canFailover = hasPermission(currentEmployee.role, 'TRIGGER_FAILOVER');

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      node.host.toLowerCase().includes(search.toLowerCase()) ||
      node.ipAddress.includes(search) ||
      node.region.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'DATABASE') return node.type === 'PRIMARY_DB' || node.type === 'REPLICA_DB';
    if (filterType === 'CACHE') return node.type === 'CACHE_SERVER';
    if (filterType === 'SERVER') return node.type === 'APP_SERVER' || node.type === 'API_GATEWAY';
    return true;
  });

  const nominalCount = nodes.filter((n) => n.status === 'NOMINAL').length;
  const warningCount = nodes.filter((n) => n.status === 'WARNING').length;
  const criticalCount = nodes.filter((n) => n.status === 'CRITICAL').length;
  const totalQps = nodes.reduce((sum, n) => sum + n.qps, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Fleet KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Monitored Fleet Nodes</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{nodes.length}</span>
            <span className="text-xs text-emerald-400 font-mono">
              {nominalCount} Nominal
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Cluster Health Status</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${warningCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {warningCount > 0 ? `${warningCount} Warning` : '100% Healthy'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Ingress QPS</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {(totalQps / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400 font-mono">req/sec</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Global Avg Latency</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">8.4 ms</span>
            <span className="text-xs text-emerald-400 font-mono">Fast SLA</span>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Fleet' },
            { id: 'DATABASE', label: 'Databases' },
            { id: 'CACHE', label: 'Redis Cache' },
            { id: 'SERVER', label: 'App & Gateway' },
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

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search host, IP or engine..."
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={onOpenAddNodeModal}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Node</span>
          </button>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNodes.map((node) => {
          const isWarning = node.status === 'WARNING';
          const isCritical = node.status === 'CRITICAL';

          return (
            <div
              key={node.id}
              className={`rounded-xl bg-slate-900 border ${
                isCritical
                  ? 'border-rose-500/60'
                  : isWarning
                  ? 'border-amber-500/60'
                  : 'border-slate-800 hover:border-slate-700'
              } p-4 flex flex-col justify-between transition-all`}
            >
              <div>
                {/* Node Title & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 truncate">
                      {node.type.includes('DB') || node.type.includes('CACHE') ? (
                        <Database className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Server className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{node.type.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate" title={node.name}>
                      {node.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      isCritical
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : isWarning
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                {/* Host Details */}
                <div className="text-[11px] font-mono text-slate-400 space-y-0.5 mt-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span>Host / IP:</span>
                    <span className="text-slate-200">{node.ipAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Region:</span>
                    <span className="text-slate-200 truncate ml-2">{node.region}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-cyan-300 truncate ml-2">{node.engine}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uptime:</span>
                    <span className="text-slate-300">{node.uptime}</span>
                  </div>
                </div>

                {/* Resource Gauges */}
                <div className="mt-4 space-y-2.5">
                  {/* CPU Usage Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-cyan-400" /> CPU Core
                      </span>
                      <span
                        className={`font-semibold tabular-nums ${
                          node.cpuUsage >= 80 ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      >
                        {node.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          node.cpuUsage >= 80 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(node.cpuUsage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Usage Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-indigo-400" /> RAM Memory
                      </span>
                      <span
                        className={`font-semibold tabular-nums ${
                          node.ramUsage >= 85 ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        {node.ramUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          node.ramUsage >= 85 ? 'bg-rose-400' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${Math.min(node.ramUsage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Latency and Active Conns */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                    <div className="bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                      <div className="text-slate-400">Latency</div>
                      <div className="text-white font-bold tabular-nums">{node.latencyMs.toFixed(1)} ms</div>
                    </div>
                    <div className="bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                      <div className="text-slate-400">Connections</div>
                      <div className="text-white font-bold tabular-nums">
                        {node.activeConnections} / {node.maxConnections}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node Operational Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedNodeLogs(node)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  <FileCode className="w-3 h-3 text-slate-400" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {node.type === 'REPLICA_DB' && (
                    <button
                      onClick={() => onFailoverNode(node.id)}
                      disabled={!canFailover}
                      title="Promote streaming replica to primary master (DBA/Super Admin only)"
                      className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 text-xs font-mono flex items-center gap-1 border border-purple-800/80 transition-colors disabled:opacity-40"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Failover</span>
                    </button>
                  )}

                  <button
                    onClick={() => onRestartNode(node.id)}
                    disabled={!canRestart}
                    title="Gracefully restart service container / process"
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 border border-slate-700 transition-colors disabled:opacity-40"
                  >
                    <RotateCw className="w-3 h-3 text-cyan-400" />
                    <span>Restart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostics / Inspect Modal */}
      {selectedNodeLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">
                  Diagnostics: {selectedNodeLogs.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeLogs(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400"># System Hardware & Kernel Status:</div>
                <div className="text-emerald-400">✓ Kernel: Linux 6.8.0-45-generic x86_64</div>
                <div className="text-slate-300">✓ VCPUs: 16 Cores | Dedicated RAM: 64 GB ECC</div>
                <div className="text-slate-300">✓ Engine Version: {selectedNodeLogs.engine}</div>
                <div className="text-slate-300">✓ Active Network Interfaces: eth0 (10 Gbps)</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-slate-400">
                <div className="text-cyan-400"># Live Standard Out Logs (Last 5 records):</div>
                <div>[2026-10-23 12:20:01] INFO  connection_pool: recycled 42 idle sockets.</div>
                <div>[2026-10-23 12:22:15] INFO  wal_sync: checkpoint starting: time</div>
                <div>[2026-10-23 12:22:18] INFO  wal_sync: checkpoint complete: wrote 892 buffers (0.1%)</div>
                <div>[2026-10-23 12:25:40] NOTICE autovacuum: vacuumed table "fixbyte_events"</div>
                <div className="text-emerald-400">[2026-10-23 12:27:10] OK    healthcheck probe: latency 3.4ms, nominal.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
