/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, CheckCircle2, Bell, Mail, Send, Check } from 'lucide-react';
import { SystemAlert } from '../types';

interface IncidentAlarmsProps {
  alerts: SystemAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onDispatchTestAlert: () => void;
}

export const IncidentAlarms: React.FC<IncidentAlarmsProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onDispatchTestAlert,
}) => {
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'ACKNOWLEDGED');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded">
              Telemetry Alarm Monitor
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Notification Channel: fixbytesupports@gmail.com
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Active Incidents & Threshold Violations
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live alarm triggers emitted when custom tracker thresholds or server health indicators are breached.
          </p>
        </div>

        <button
          onClick={onDispatchTestAlert}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dispatch Test Notification</span>
        </button>
      </div>

      {/* Active Incidents List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Active Alarms ({activeAlerts.length})
        </h3>

        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              alert.severity === 'CRITICAL'
                ? 'bg-rose-950/20 border-rose-800/80'
                : 'bg-amber-950/20 border-amber-800/80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{alert.metricTitle}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-900 text-rose-200'
                        : 'bg-amber-900 text-amber-200'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Node: <span className="text-slate-200">{alert.nodeName}</span> · Value:{' '}
                  <span className="text-white font-bold">{alert.currentValue.toFixed(1)} {alert.unit}</span> (Threshold: ≥{alert.threshold} {alert.unit})
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Triggered at {alert.timestamp} · Alert dispatched to fixbytesupports@gmail.com
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onAcknowledgeAlert(alert.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Acknowledge
              </button>
              <button
                onClick={() => onResolveAlert(alert.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ))}

        {activeAlerts.length === 0 && (
          <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-white">All Alarms Clear</div>
            <p className="text-xs text-slate-400 mt-0.5">
              No threshold breaches are active. All database and compute nodes are within configured limits.
            </p>
          </div>
        )}
      </div>

      {/* Acknowledged / In Triage */}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Acknowledged / In Triage ({acknowledgedAlerts.length})
          </h3>

          {acknowledgedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-200">{alert.metricTitle}</span> on{' '}
                <span className="font-mono text-cyan-300">{alert.nodeName}</span>
                <span className="text-slate-400 font-mono ml-2">({alert.currentValue.toFixed(1)} {alert.unit})</span>
              </div>
              <button
                onClick={() => onResolveAlert(alert.id)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] border border-slate-700"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
