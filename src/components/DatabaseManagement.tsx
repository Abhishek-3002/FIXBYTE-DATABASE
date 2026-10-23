/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  ArrowRightLeft,
  Search,
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';
import { ServerNode, Employee } from '../types';
import { hasPermission } from '../utils/telemetry';

interface DatabaseManagementProps {
  nodes: ServerNode[];
  currentEmployee: Employee;
  onKillQuery: (queryId: string) => void;
  onRunSandboxQuery: (query: string) => void;
}

interface SlowQuery {
  id: string;
  pid: number;
  database: string;
  user: string;
  durationMs: number;
  query: string;
  state: 'active' | 'idle in transaction' | 'waiting';
  startedAt: string;
}

export const DatabaseManagement: React.FC<DatabaseManagementProps> = ({
  nodes,
  currentEmployee,
  onKillQuery,
  onRunSandboxQuery,
}) => {
  const [sandboxQuery, setSandboxQuery] = useState(
    'SELECT u.id, u.email, count(t.id) as tx_count FROM fixbyte_users u JOIN fixbyte_transactions t ON u.id = t.user_id GROUP BY u.id, u.email ORDER BY tx_count DESC LIMIT 25;'
  );
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const canExecuteQueries = hasPermission(currentEmployee.role, 'EXECUTE_QUERIES');
  const canTerminate = hasPermission(currentEmployee.role, 'TERMINATE_CONNECTIONS');

  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([
    {
      id: 'sq-1',
      pid: 48921,
      database: 'fixbyte_production',
      user: 'app_backend_service',
      durationMs: 4120,
      query: 'SELECT * FROM audit_telemetry_events WHERE payload::text ILIKE \'%error%\' ORDER BY created_at DESC;',
      state: 'active',
      startedAt: '4.1s ago',
    },
    {
      id: 'sq-2',
      pid: 51204,
      database: 'fixbyte_billing',
      user: 'finance_reconciler',
      durationMs: 1840,
      query: 'UPDATE invoices SET status = \'ARCHIVED\' WHERE due_date < NOW() - INTERVAL \'180 days\';',
      state: 'waiting',
      startedAt: '1.8s ago',
    },
    {
      id: 'sq-3',
      pid: 53199,
      database: 'fixbyte_production',
      user: 'etl_worker_replica',
      durationMs: 890,
      query: 'SELECT date_trunc(\'hour\', timestamp), count(*) FROM access_logs GROUP BY 1;',
      state: 'active',
      startedAt: '890ms ago',
    },
  ]);

  const dbNodes = nodes.filter(
    (n) => n.type === 'PRIMARY_DB' || n.type === 'REPLICA_DB' || n.type === 'CACHE_SERVER'
  );

  const handleRunConsole = () => {
    setIsExecuting(true);
    setTimeout(() => {
      onRunSandboxQuery(sandboxQuery);
      setExecutionOutput(`Query completed successfully.\nRows affected / returned: 25 rows in 4.2ms.\nCache hit: YES (Shared buffer 8KB blocks hit: 324, read: 0).\nExecution Plan: HashAggregate (cost=142.10..150.25 rows=25 width=48)`);
      setIsExecuting(false);
    }, 450);
  };

  const handleKill = (id: string, pid: number) => {
    if (!canTerminate) {
      alert('Access Denied: You do not possess the TERMINATE_CONNECTIONS permission.');
      return;
    }
    setSlowQueries((prev) => prev.filter((q) => q.id !== id));
    onKillQuery(`PID ${pid}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Cluster Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
                FixByte HA Database Topology
              </span>
              <span className="text-xs text-slate-400 font-mono">Postgres 16.4 Multi-AZ + Redis 7</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Database Reliability & Connection Mesh
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time monitoring of master/replica replication sync, live connection pool exhaustion, transaction locks, and query termination.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>WAL Sync: In Sync (0 lag)</span>
            </span>
          </div>
        </div>

        {/* Replication Topology Visualizer */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          {dbNodes.map((db) => (
            <div key={db.id} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  {db.type === 'PRIMARY_DB' ? 'Master (Read/Write)' : db.type === 'REPLICA_DB' ? 'Replica (Read-Only)' : 'In-Memory Cache'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  ONLINE
                </span>
              </div>
              <div className="text-sm font-bold text-white truncate">{db.name}</div>
              <div className="text-xs font-mono text-slate-400 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span className="text-slate-200">{db.activeConnections} / {db.maxConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Query Latency:</span>
                  <span className="text-cyan-300 font-bold">{db.latencyMs} ms</span>
                </div>
                {db.cacheHitRatio !== undefined && (
                  <div className="flex justify-between">
                    <span>Cache Hit Ratio:</span>
                    <span className="text-emerald-400 font-bold">{db.cacheHitRatio}%</span>
                  </div>
                )}
                {db.replicationLagMs !== undefined && (
                  <div className="flex justify-between">
                    <span>Replication Lag:</span>
                    <span className="text-emerald-400">{db.replicationLagMs} ms</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slow Query Monitor & Lock Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Active Long-Running & Slow Query Monitor</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Queries executing longer than 500ms. Administrators can terminate rogue statements immediately.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {slowQueries.length} Active Long Queries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Database</th>
                <th className="py-2.5 px-3">Role / App</th>
                <th className="py-2.5 px-3">Elapsed Time</th>
                <th className="py-2.5 px-3">Statement</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {slowQueries.map((sq) => (
                <tr key={sq.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-cyan-300 font-bold">{sq.pid}</td>
                  <td className="py-3 px-3 text-slate-300">{sq.database}</td>
                  <td className="py-3 px-3 text-slate-400">{sq.user}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      sq.durationMs > 3000
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {sq.durationMs} ms
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-md">
                    <div className="truncate text-slate-200" title={sq.query}>
                      {sq.query}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleKill(sq.id, sq.pid)}
                      disabled={!canTerminate}
                      className="px-2.5 py-1 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors disabled:opacity-40"
                    >
                      Kill Query
                    </button>
                  </td>
                </tr>
              ))}
              {slowQueries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                    ✓ All connection queries are within nominal threshold limits. No slow queries detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Execution Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Database Query Console</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Target: Primary Cluster master</span>
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={sandboxQuery}
            onChange={(e) => setSandboxQuery(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSandboxQuery(
                    'EXPLAIN ANALYZE SELECT * FROM fixbyte_billing WHERE amount > 500 ORDER BY id DESC LIMIT 50;'
                  )
                }
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700"
              >
                Sample: Billing Query
              </button>
              <button
                type="button"
                onClick={() =>
                  setSandboxQuery('SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_user_tables;')
                }
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700"
              >
                Sample: Vacuum Statistics
              </button>
            </div>

            <button
              onClick={handleRunConsole}
              disabled={isExecuting || !canExecuteQueries}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isExecuting ? 'Executing...' : 'Execute Statement'}</span>
            </button>
          </div>

          {executionOutput && (
            <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {executionOutput}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
