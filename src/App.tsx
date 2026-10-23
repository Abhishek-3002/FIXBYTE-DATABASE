/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CustomTracker,
  Employee,
  HealthStatus,
  ServerNode,
  SystemAlert,
  AuditLog,
  UserRole,
} from './types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SERVERS,
  INITIAL_TRACKERS,
  INITIAL_AUDIT_LOGS,
  evaluateMetricStatus,
  getMetricDirection,
  hasPermission,
} from './utils/telemetry';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CustomTrackingStudio } from './components/CustomTrackingStudio';
import { InfrastructureOverview } from './components/InfrastructureOverview';
import { DatabaseManagement } from './components/DatabaseManagement';
import { EmployeeAccessControl } from './components/EmployeeAccessControl';
import { IncidentAlarms } from './components/IncidentAlarms';
import { AuditTrail } from './components/AuditTrail';
import { TrackerModal } from './components/TrackerModal';
import { NodeModal } from './components/NodeModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('custom-tracking');

  // Operator State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(INITIAL_EMPLOYEES[0]);

  // Infrastructure & Tracking State
  const [nodes, setNodes] = useState<ServerNode[]>(INITIAL_SERVERS);
  const [trackers, setTrackers] = useState<CustomTracker[]>(INITIAL_TRACKERS);
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alt-01',
      timestamp: '12:20:14',
      severity: 'WARNING',
      metricTitle: 'Compute Cluster CPU Saturation',
      nodeName: 'fxb-srv-compute-worker-us-east',
      currentValue: 79.8,
      threshold: 75,
      unit: '%',
      status: 'ACTIVE',
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS as any);

  // Live Telemetry Controls
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState<boolean>(true);
  const [refreshRateSec, setRefreshRateSec] = useState<number>(2);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState<boolean>(false);

  // Modals
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<CustomTracker | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Notification Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Helper to record an audit log event
  const addAuditLog = useCallback(
    (action: string, target: string, status: 'SUCCESS' | 'WARNING' | 'DENIED', details: string) => {
      const now = new Date();
      const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp,
        actorName: currentEmployee.name,
        actorRole: currentEmployee.role,
        action,
        target,
        status,
        details,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentEmployee]
  );

  // Telemetry Engine Loop
  useEffect(() => {
    if (!isLiveTrackingActive) return;

    const interval = setInterval(() => {
      // 1. Tick server node values
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const loadMultiplier = isSimulatingLoad ? 1.6 : 1.0;
          const cpuDelta = (Math.random() - 0.48) * 3 * loadMultiplier;
          const ramDelta = (Math.random() - 0.49) * 1.5;
          const latencyDelta = (Math.random() - 0.45) * 2 * (isSimulatingLoad ? 6 : 1);

          const newCpu = Math.min(99.5, Math.max(8, +(node.cpuUsage + cpuDelta).toFixed(1)));
          const newRam = Math.min(98.0, Math.max(15, +(node.ramUsage + ramDelta).toFixed(1)));
          const newLatency = Math.max(0.4, +(node.latencyMs + latencyDelta).toFixed(1));

          let newStatus: HealthStatus = 'NOMINAL';
          if (newCpu >= 90 || newLatency >= 80) newStatus = 'CRITICAL';
          else if (newCpu >= 75 || newLatency >= 25) newStatus = 'WARNING';

          return {
            ...node,
            cpuUsage: newCpu,
            ramUsage: newRam,
            latencyMs: newLatency,
            status: newStatus,
          };
        })
      );

      // 2. Tick custom trackers with their live values and push history
      setTrackers((prevTrackers) =>
        prevTrackers.map((tracker) => {
          if (!tracker.enabled) return tracker;

          let nextValue = tracker.currentValue;
          const variance = tracker.unit === '%' ? 2.5 : tracker.unit === 'ms' ? 4 : 50;
          const spikeBonus = isSimulatingLoad ? variance * 2.5 : 0;
          const jitter = (Math.random() - 0.48) * variance + spikeBonus;

          nextValue = Math.max(0, +(tracker.currentValue + jitter).toFixed(1));

          // Direction evaluation
          const direction = getMetricDirection(tracker.metricType);
          const status = evaluateMetricStatus(
            nextValue,
            tracker.warningThreshold,
            tracker.criticalThreshold,
            direction
          );

          // Add to history (keep 20 points)
          const newHistory = [
            ...tracker.history.slice(1),
            { timestamp: Date.now(), value: nextValue },
          ];

          // Trigger automated alert if breached
          if (status === 'CRITICAL' || status === 'WARNING') {
            setAlerts((prevAlerts) => {
              const existing = prevAlerts.find(
                (a) => a.metricTitle === tracker.title && a.status === 'ACTIVE'
              );
              if (!existing) {
                const now = new Date().toTimeString().slice(0, 8);
                return [
                  {
                    id: `alt-${Date.now()}`,
                    timestamp: now,
                    severity: status,
                    metricTitle: tracker.title,
                    nodeName: tracker.targetNodeName,
                    currentValue: nextValue,
                    threshold:
                      status === 'CRITICAL' ? tracker.criticalThreshold : tracker.warningThreshold,
                    unit: tracker.unit,
                    status: 'ACTIVE',
                  },
                  ...prevAlerts,
                ];
              }
              return prevAlerts;
            });
          }

          return {
            ...tracker,
            currentValue: nextValue,
            status,
            history: newHistory,
          };
        })
      );
    }, refreshRateSec * 1000);

    return () => clearInterval(interval);
  }, [isLiveTrackingActive, refreshRateSec, isSimulatingLoad]);

  // Handle Add or Edit Custom Tracker
  const handleSaveTracker = (trackerData: Partial<CustomTracker>) => {
    if (editingTracker) {
      setTrackers((prev) =>
        prev.map((t) => (t.id === editingTracker.id ? ({ ...t, ...trackerData } as CustomTracker) : t))
      );
      addAuditLog(
        'CUSTOM_TRACKER_UPDATED',
        trackerData.title || editingTracker.title,
        'SUCCESS',
        `Adjusted thresholds: Warn >= ${trackerData.warningThreshold}, Crit >= ${trackerData.criticalThreshold}`
      );
      showToast(`Updated tracker: ${trackerData.title}`);
    } else {
      const newId = `track-${Date.now()}`;
      const newTracker: CustomTracker = {
        id: newId,
        title: trackerData.title || 'Custom Telemetry Tracker',
        metricType: trackerData.metricType || 'QUERY_LATENCY',
        targetNodeId: trackerData.targetNodeId || 'GLOBAL',
        targetNodeName: trackerData.targetNodeName || 'Global Fleet',
        chartType: trackerData.chartType || 'area',
        unit: trackerData.unit || 'ms',
        refreshIntervalSec: trackerData.refreshIntervalSec || 2,
        warningThreshold: trackerData.warningThreshold || 50,
        criticalThreshold: trackerData.criticalThreshold || 80,
        alertAction: trackerData.alertAction || 'EMAIL',
        notificationTarget: trackerData.notificationTarget || 'fixbytesupports@gmail.com',
        enabled: true,
        currentValue: 12.0,
        status: 'NOMINAL',
        notes: trackerData.notes,
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - (20 - i) * 2000,
          value: +(10 + Math.random() * 5).toFixed(1),
        })),
      };
      setTrackers((prev) => [newTracker, ...prev]);
      addAuditLog(
        'CUSTOM_TRACKER_CREATED',
        newTracker.title,
        'SUCCESS',
        `Configured new custom live tracker for ${newTracker.targetNodeName} with ${newTracker.alertAction} routing.`
      );
      showToast(`Deployed custom tracker: ${newTracker.title}`);
    }
    setEditingTracker(null);
  };

  const handleDeleteTracker = (trackerId: string) => {
    const target = trackers.find((t) => t.id === trackerId);
    if (!target) return;
    if (!hasPermission(currentEmployee.role, 'CUSTOMIZE_TRACKING')) {
      showToast('Permission Denied: Only authorized operators can delete trackers.');
      return;
    }
    setTrackers((prev) => prev.filter((t) => t.id !== trackerId));
    addAuditLog('CUSTOM_TRACKER_DELETED', target.title, 'WARNING', 'Tracker removed from active telemetry feed.');
    showToast(`Deleted tracker: ${target.title}`);
  };

  const handleToggleTracker = (trackerId: string) => {
    setTrackers((prev) =>
      prev.map((t) => {
        if (t.id === trackerId) {
          const next = !t.enabled;
          showToast(`${next ? 'Resumed' : 'Paused'} tracking for ${t.title}`);
          return { ...t, enabled: next };
        }
        return t;
      })
    );
  };

  const handleSimulateTrackerSpike = (trackerId: string) => {
    setTrackers((prev) =>
      prev.map((t) => {
        if (t.id === trackerId) {
          const spiked = +(t.criticalThreshold * 1.15).toFixed(1);
          showToast(`Simulated traffic spike on ${t.title}: spiked to ${spiked} ${t.unit}!`);
          return {
            ...t,
            currentValue: spiked,
            status: 'CRITICAL',
            history: [...t.history.slice(1), { timestamp: Date.now(), value: spiked }],
          };
        }
        return t;
      })
    );
  };

  // Node Management
  const handleAddNode = (newNodeData: Partial<ServerNode>) => {
    const newNode: ServerNode = {
      id: `node-${Date.now()}`,
      name: newNodeData.name || 'fxb-custom-node',
      type: newNodeData.type || 'PRIMARY_DB',
      host: newNodeData.host || 'node.fixbyte.internal',
      ipAddress: newNodeData.ipAddress || '10.240.20.10',
      region: newNodeData.region || 'ap-south-1',
      engine: newNodeData.engine || 'PostgreSQL 16.4 Enterprise',
      status: 'NOMINAL',
      cpuUsage: newNodeData.cpuUsage || 25,
      ramUsage: newNodeData.ramUsage || 40,
      diskUsage: newNodeData.diskUsage || 30,
      latencyMs: newNodeData.latencyMs || 4.2,
      activeConnections: newNodeData.activeConnections || 150,
      maxConnections: newNodeData.maxConnections || 1500,
      qps: newNodeData.qps || 3200,
      uptime: 'Just started',
      slowQueryCount: 0,
      cacheHitRatio: newNodeData.cacheHitRatio,
    };
    setNodes((prev) => [newNode, ...prev]);
    addAuditLog(
      'NODE_REGISTERED',
      newNode.name,
      'SUCCESS',
      `Provisioned ${newNode.type} in region ${newNode.region} with engine ${newNode.engine}`
    );
    showToast(`Registered node: ${newNode.name}`);
  };

  const handleRestartNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (!hasPermission(currentEmployee.role, 'RESTART_SERVICES')) {
      showToast('Access Denied: You do not possess RESTART_SERVICES privileges.');
      addAuditLog('SERVICE_RESTART_DENIED', node.name, 'DENIED', 'RBAC policy blocked restart attempt.');
      return;
    }
    showToast(`Gracefully restarting container service for ${node.name}...`);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, cpuUsage: 12.0, latencyMs: 1.8, status: 'NOMINAL', uptime: '0m 10s' }
            : n
        )
      );
      addAuditLog('SERVICE_RESTARTED', node.name, 'SUCCESS', 'Container service process reboot completed in 820ms.');
      showToast(`Node ${node.name} restarted and nominal!`);
    }, 1000);
  };

  const handleFailoverNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (!hasPermission(currentEmployee.role, 'TRIGGER_FAILOVER')) {
      showToast('Access Denied: TRIGGER_FAILOVER requires DATABASE_ADMIN or SUPER_ADMIN role.');
      addAuditLog('FAILOVER_DENIED', node.name, 'DENIED', 'Insufficient security clearance.');
      return;
    }
    showToast(`Promoting read replica ${node.name} to Primary Master...`);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, type: 'PRIMARY_DB', name: n.name.replace('replica', 'master-promoted') }
            : n
        )
      );
      addAuditLog('FAILOVER_PROMOTION_COMPLETED', node.name, 'WARNING', 'Streaming replica promoted to master with zero data loss.');
      showToast(`Failover successful: ${node.name} is now Primary Master!`);
    }, 1200);
  };

  // Queries
  const handleExecuteTestQuery = (query: string, nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    const latency = +(2.0 + Math.random() * 4.5).toFixed(1);
    addAuditLog('QUERY_PROBE_EXECUTED', targetNode?.name || 'Primary DB', 'SUCCESS', `Query: ${query.slice(0, 60)}...`);
    return {
      latencyMs: latency,
      status: '200 OK (Probe nominal)',
      rows: Math.floor(10 + Math.random() * 50),
    };
  };

  const handleKillQuery = (queryDesc: string) => {
    addAuditLog('QUERY_TERMINATED', queryDesc, 'WARNING', `Terminated locking session by ${currentEmployee.name}`);
    showToast(`Terminated rogue query: ${queryDesc}`);
  };

  // Employees & Roles
  const handleAddEmployee = (newEmpData: Partial<Employee>) => {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmpData.name || 'New Engineer',
      email: newEmpData.email || 'engineer@fixbyte.io',
      role: newEmpData.role || 'SRE_ENGINEER',
      department: newEmpData.department || 'Operations',
      avatar: newEmpData.avatar || '',
      status: 'ACTIVE',
      lastActive: 'Just invited',
      apiKey: newEmpData.apiKey || `fxb_${Math.random().toString(36).substring(2, 12)}`,
      twoFactorEnabled: true,
    };
    setEmployees((prev) => [...prev, newEmp]);
    addAuditLog('EMPLOYEE_PROVISIONED', newEmp.name, 'SUCCESS', `Granted role ${newEmp.role} to ${newEmp.email}`);
    showToast(`Invited ${newEmp.name} as ${newEmp.role}`);
  };

  const handleUpdateRole = (employeeId: string, newRole: UserRole) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          addAuditLog('ROLE_MODIFIED', e.name, 'WARNING', `Role changed from ${e.role} to ${newRole}`);
          return { ...e, role: newRole };
        }
        return e;
      })
    );
    showToast(`Updated employee role to ${newRole}`);
  };

  // Alerts
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    showToast('Alert acknowledged and marked in triage.');
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
    );
    showToast('Alert resolved.');
  };

  const handleDispatchTestAlert = () => {
    showToast('Dispatched test incident notification to fixbytesupports@gmail.com!');
    addAuditLog(
      'TEST_ALERT_DISPATCHED',
      'fixbytesupports@gmail.com',
      'SUCCESS',
      'Test webhook payload sent with 200 OK response from notification gateway.'
    );
  };

  // Data Export
  const handleExportTelemetry = () => {
    const payload = JSON.stringify({ company: 'FixByte', exportedAt: new Date().toISOString(), trackers, nodes }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixbyte_telemetry_${Date.now()}.json`;
    a.click();
    showToast('Exported live telemetry snapshot to JSON!');
  };

  const handleExportLogs = () => {
    const payload = JSON.stringify({ company: 'FixByte', auditLogs }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixbyte_audit_trail_${Date.now()}.json`;
    a.click();
    showToast('Exported immutable audit trail to JSON!');
  };

  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-slate-900 border border-cyan-500/60 shadow-xl text-xs font-mono text-cyan-300 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentEmployee={currentEmployee}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader
          currentTab={currentTab}
          isLiveTrackingActive={isLiveTrackingActive}
          onToggleLiveTracking={() => setIsLiveTrackingActive((prev) => !prev)}
          refreshRateSec={refreshRateSec}
          onChangeRefreshRate={setRefreshRateSec}
          isSimulatingLoad={isSimulatingLoad}
          onToggleSimulateLoad={() => {
            setIsSimulatingLoad((prev) => !prev);
            showToast(isSimulatingLoad ? 'Simulation ended.' : 'Traffic spike simulation active!');
          }}
          onOpenAddTrackerModal={() => {
            setEditingTracker(null);
            setIsTrackerModalOpen(true);
          }}
          onOpenAddNodeModal={() => setIsNodeModalOpen(true)}
          currentEmployee={currentEmployee}
          activeAlertCount={activeAlertCount}
          onSelectTab={setCurrentTab}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'custom-tracking' && (
            <CustomTrackingStudio
              trackers={trackers}
              nodes={nodes}
              currentEmployee={currentEmployee}
              onOpenAddModal={() => {
                setEditingTracker(null);
                setIsTrackerModalOpen(true);
              }}
              onEditTracker={(tracker) => {
                setEditingTracker(tracker);
                setIsTrackerModalOpen(true);
              }}
              onDeleteTracker={handleDeleteTracker}
              onToggleTracker={handleToggleTracker}
              onSimulateTrackerSpike={handleSimulateTrackerSpike}
              onExecuteTestQuery={handleExecuteTestQuery}
              onExportTelemetry={handleExportTelemetry}
            />
          )}

          {currentTab === 'infrastructure' && (
            <InfrastructureOverview
              nodes={nodes}
              currentEmployee={currentEmployee}
              onRestartNode={handleRestartNode}
              onFailoverNode={handleFailoverNode}
              onOpenAddNodeModal={() => setIsNodeModalOpen(true)}
            />
          )}

          {currentTab === 'databases' && (
            <DatabaseManagement
              nodes={nodes}
              currentEmployee={currentEmployee}
              onKillQuery={handleKillQuery}
              onRunSandboxQuery={(q) =>
                addAuditLog('SANDBOX_QUERY_RUN', 'PostgreSQL Master', 'SUCCESS', `Query: ${q.slice(0, 50)}...`)
              }
            />
          )}

          {currentTab === 'access-control' && (
            <EmployeeAccessControl
              employees={employees}
              currentEmployee={currentEmployee}
              onSwitchEmployee={setCurrentEmployee}
              onAddEmployee={handleAddEmployee}
              onUpdateRole={handleUpdateRole}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentAlarms
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onDispatchTestAlert={handleDispatchTestAlert}
            />
          )}

          {currentTab === 'audit-trail' && (
            <AuditTrail logs={auditLogs} onExportLogs={handleExportLogs} />
          )}
        </main>
      </div>

      {/* Modals */}
      <TrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => {
          setIsTrackerModalOpen(false);
          setEditingTracker(null);
        }}
        onSave={handleSaveTracker}
        initialTracker={editingTracker}
        nodes={nodes}
      />

      <NodeModal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
        onAddNode={handleAddNode}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        employees={employees}
        currentEmployee={currentEmployee}
        onSelectEmployee={(emp) => {
          setCurrentEmployee(emp);
          showToast(`Switched active session to ${emp.name} (${emp.role})`);
        }}
      />
    </div>
  );
}
