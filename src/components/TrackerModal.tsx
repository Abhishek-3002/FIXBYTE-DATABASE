/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sliders, Bell, Sparkles, Check, Database, Server } from 'lucide-react';
import { CustomTracker, ServerNode, TrackerMetricType } from '../types';

interface TrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trackerData: Partial<CustomTracker>) => void;
  initialTracker?: CustomTracker | null;
  nodes: ServerNode[];
}

export const TrackerModal: React.FC<TrackerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTracker,
  nodes,
}) => {
  const [title, setTitle] = useState('');
  const [metricType, setMetricType] = useState<TrackerMetricType>('QUERY_LATENCY');
  const [targetNodeId, setTargetNodeId] = useState('node-pg-primary');
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(2);
  const [warningThreshold, setWarningThreshold] = useState(25);
  const [criticalThreshold, setCriticalThreshold] = useState(70);
  const [alertAction, setAlertAction] = useState<'WEBHOOK' | 'EMAIL' | 'SLACK' | 'AUTO_THROTTLE'>('EMAIL');
  const [notificationTarget, setNotificationTarget] = useState('fixbytesupports@gmail.com');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialTracker) {
      setTitle(initialTracker.title);
      setMetricType(initialTracker.metricType);
      setTargetNodeId(initialTracker.targetNodeId);
      setRefreshIntervalSec(initialTracker.refreshIntervalSec);
      setWarningThreshold(initialTracker.warningThreshold);
      setCriticalThreshold(initialTracker.criticalThreshold);
      setAlertAction(initialTracker.alertAction);
      setNotificationTarget(initialTracker.notificationTarget);
      setNotes(initialTracker.notes || '');
    } else {
      setTitle('Primary Database Replication & IOPS Monitor');
      setMetricType('QUERY_LATENCY');
      setTargetNodeId('node-pg-primary');
      setRefreshIntervalSec(2);
      setWarningThreshold(25);
      setCriticalThreshold(80);
      setAlertAction('EMAIL');
      setNotificationTarget('fixbytesupports@gmail.com');
      setNotes('Immediate alert to DevOps on-call if master query latency breaches SLA.');
    }
  }, [initialTracker, isOpen]);

  if (!isOpen) return null;

  const handleMetricTypeChange = (type: TrackerMetricType) => {
    setMetricType(type);
    switch (type) {
      case 'CPU_USAGE':
      case 'RAM_USAGE':
        setWarningThreshold(75);
        setCriticalThreshold(90);
        break;
      case 'QUERY_LATENCY':
        setWarningThreshold(25);
        setCriticalThreshold(80);
        break;
      case 'CACHE_HIT_RATIO':
        setWarningThreshold(92);
        setCriticalThreshold(85);
        break;
      case 'ACTIVE_CONNECTIONS':
        setWarningThreshold(1200);
        setCriticalThreshold(2000);
        break;
      case 'REPLICATION_LAG':
        setWarningThreshold(100);
        setCriticalThreshold(500);
        break;
      case 'ERROR_RATE_5XX':
        setWarningThreshold(1.5);
        setCriticalThreshold(4.0);
        break;
      default:
        setWarningThreshold(50);
        setCriticalThreshold(80);
    }
  };

  const getUnit = (type: TrackerMetricType): string => {
    switch (type) {
      case 'CPU_USAGE':
      case 'RAM_USAGE':
      case 'CACHE_HIT_RATIO':
      case 'ERROR_RATE_5XX':
        return '%';
      case 'QUERY_LATENCY':
      case 'REPLICATION_LAG':
        return 'ms';
      case 'ACTIVE_CONNECTIONS':
        return 'conn';
      case 'DISK_IOPS':
        return 'IOPS';
      case 'THROUGHPUT_QPS':
        return 'qps';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedNode = nodes.find((n) => n.id === targetNodeId);
    const targetNodeName = targetNodeId === 'GLOBAL' ? 'Global Infrastructure Fleet' : selectedNode?.name || 'Target Node';

    onSave({
      title: title.trim() || 'Custom Telemetry Tracker',
      metricType,
      targetNodeId,
      targetNodeName,
      unit: getUnit(metricType),
      refreshIntervalSec,
      warningThreshold: Number(warningThreshold),
      criticalThreshold: Number(criticalThreshold),
      alertAction,
      notificationTarget: notificationTarget.trim() || 'fixbytesupports@gmail.com',
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialTracker ? 'Customize Live Tracker' : 'Create New Live Telemetry Tracker'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure real-time monitoring rules, sample cadence, and alert thresholds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Tracker Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tracker Name / Metric Label <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Postgres Master Read/Write Query Latency"
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Target Component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monitored Node / Target
              </label>
              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="GLOBAL">Global Fleet (All Nodes Aggregated)</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Metric Telemetry Key
              </label>
              <select
                value={metricType}
                onChange={(e) => handleMetricTypeChange(e.target.value as TrackerMetricType)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="QUERY_LATENCY">Query Execution Latency (ms)</option>
                <option value="CPU_USAGE">CPU Core Saturation (%)</option>
                <option value="RAM_USAGE">RAM Utilization (%)</option>
                <option value="ACTIVE_CONNECTIONS">Active Database Connections (conn)</option>
                <option value="REPLICATION_LAG">Replication Sync Lag (ms)</option>
                <option value="CACHE_HIT_RATIO">Redis Cache Hit Ratio (%)</option>
                <option value="DISK_IOPS">Disk Read/Write IOPS</option>
                <option value="ERROR_RATE_5XX">5xx HTTP Error Rate (%)</option>
                <option value="THROUGHPUT_QPS">Throughput Queries/Sec (QPS)</option>
              </select>
            </div>
          </div>

          {/* Threshold Sliders & Inputs */}
          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Alert Threshold Boundaries
              </span>
              <span className="text-[11px] font-mono text-cyan-400">Unit: {getUnit(metricType)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-amber-400 font-mono mb-1">
                  Warning Level (≥)
                </label>
                <input
                  type="number"
                  step="any"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-rose-400 font-mono mb-1">
                  Critical Level (≥)
                </label>
                <input
                  type="number"
                  step="any"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Sample Frequency and Action Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telemetry Probing Frequency
              </label>
              <select
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value={1}>1 second (High Resolution)</option>
                <option value={2}>2 seconds (Standard Telemetry)</option>
                <option value={5}>5 seconds (Battery / Bandwidth Saver)</option>
                <option value={10}>10 seconds (Slow Polling)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Trigger Action Protocol
              </label>
              <select
                value={alertAction}
                onChange={(e) => setAlertAction(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="EMAIL">Email Dispatch (fixbytesupports@gmail.com)</option>
                <option value="WEBHOOK">Webhook POST Event</option>
                <option value="SLACK">Slack Incident Channel</option>
                <option value="AUTO_THROTTLE">Auto-Throttle Traffic Ingress</option>
              </select>
            </div>
          </div>

          {/* Notification Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notification Endpoint / Recipient
            </label>
            <input
              type="text"
              value={notificationTarget}
              onChange={(e) => setNotificationTarget(e.target.value)}
              placeholder="e.g. fixbytesupports@gmail.com or https://api.fixbyte.io/webhook"
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Operational Runbook Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Operational Playbook / Context Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. If latency > 80ms, initiate read replica redirect and check locking transactions."
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              {initialTracker ? 'Save Changes' : 'Deploy Custom Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
