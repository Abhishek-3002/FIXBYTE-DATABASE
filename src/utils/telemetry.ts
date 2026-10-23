/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CustomTracker,
  Employee,
  HealthStatus,
  Permission,
  ServerNode,
  TrackerMetricType,
  UserRole,
} from '../types';

/**
 * Standard role to permission mapping for FixByte
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'MANAGE_SERVERS',
    'MANAGE_DATABASES',
    'CUSTOMIZE_TRACKING',
    'RESTART_SERVICES',
    'TRIGGER_FAILOVER',
    'VIEW_AUDIT_LOGS',
    'MANAGE_USERS',
    'EXECUTE_QUERIES',
    'TERMINATE_CONNECTIONS',
  ],
  DEVOPS_LEAD: [
    'MANAGE_SERVERS',
    'MANAGE_DATABASES',
    'CUSTOMIZE_TRACKING',
    'RESTART_SERVICES',
    'TRIGGER_FAILOVER',
    'VIEW_AUDIT_LOGS',
    'EXECUTE_QUERIES',
    'TERMINATE_CONNECTIONS',
  ],
  DATABASE_ADMIN: [
    'MANAGE_DATABASES',
    'CUSTOMIZE_TRACKING',
    'RESTART_SERVICES',
    'TRIGGER_FAILOVER',
    'VIEW_AUDIT_LOGS',
    'EXECUTE_QUERIES',
    'TERMINATE_CONNECTIONS',
  ],
  SRE_ENGINEER: [
    'MANAGE_SERVERS',
    'CUSTOMIZE_TRACKING',
    'RESTART_SERVICES',
    'VIEW_AUDIT_LOGS',
    'EXECUTE_QUERIES',
  ],
  SUPPORT_ANALYST: [
    'CUSTOMIZE_TRACKING',
    'VIEW_AUDIT_LOGS',
  ],
};

/**
 * Checks if a given user role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Evaluates whether a metric value breaches warning or critical thresholds
 */
export function evaluateMetricStatus(
  value: number,
  warningThreshold: number,
  criticalThreshold: number,
  direction: 'higher_is_worse' | 'lower_is_worse' = 'higher_is_worse'
): HealthStatus {
  if (direction === 'higher_is_worse') {
    if (value >= criticalThreshold) return 'CRITICAL';
    if (value >= warningThreshold) return 'WARNING';
    return 'NOMINAL';
  } else {
    if (value <= criticalThreshold) return 'CRITICAL';
    if (value <= warningThreshold) return 'WARNING';
    return 'NOMINAL';
  }
}

/**
 * Determine direction for a metric type
 */
export function getMetricDirection(metricType: TrackerMetricType): 'higher_is_worse' | 'lower_is_worse' {
  if (metricType === 'CACHE_HIT_RATIO') {
    return 'lower_is_worse';
  }
  return 'higher_is_worse';
}

/**
 * Format metric value with appropriate unit
 */
export function formatMetricValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'ms') {
    return `${Math.round(value)} ms`;
  }
  if (unit === 'req/s' || unit === 'qps') {
    return `${Math.round(value).toLocaleString()} qps`;
  }
  if (unit === 'conn') {
    return `${Math.round(value)} conn`;
  }
  if (unit === 'IOPS') {
    return `${Math.round(value).toLocaleString()} IOPS`;
  }
  return `${value.toFixed(1)} ${unit}`.trim();
}

/**
 * Initial Employees directory
 */
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    name: 'Vikram Sharma',
    email: 'vikram.s@fixbyte.io',
    role: 'SUPER_ADMIN',
    department: 'Infrastructure & Cloud Architecture',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
    status: 'ACTIVE',
    lastActive: 'Just now',
    apiKey: 'fxb_live_sec_99a8b1c4e2d3f7',
    twoFactorEnabled: true,
  },
  {
    id: 'emp-02',
    name: 'Anya Patel',
    email: 'anya.p@fixbyte.io',
    role: 'DATABASE_ADMIN',
    department: 'Data Reliability & Clustering',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=128&q=80',
    status: 'ON_CALL',
    lastActive: '5m ago',
    apiKey: 'fxb_live_sec_77f4c2e1b8a9d0',
    twoFactorEnabled: true,
  },
  {
    id: 'emp-03',
    name: 'Rahul Verma',
    email: 'rahul.v@fixbyte.io',
    role: 'SRE_ENGINEER',
    department: 'Site Reliability Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    status: 'ACTIVE',
    lastActive: '12m ago',
    apiKey: 'fxb_live_sec_33b8a1c9d4f2e6',
    twoFactorEnabled: true,
  },
  {
    id: 'emp-04',
    name: 'Priya Rao',
    email: 'priya.r@fixbyte.io',
    role: 'SUPPORT_ANALYST',
    department: 'Customer Tier-3 Operations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80',
    status: 'ACTIVE',
    lastActive: '1h ago',
    apiKey: 'fxb_live_sec_11a2c3d4e5f6a7',
    twoFactorEnabled: false,
  },
];

/**
 * Initial Server and Database Fleet
 */
export const INITIAL_SERVERS: ServerNode[] = [
  {
    id: 'node-pg-primary',
    name: 'fxb-db-postgres-prod-01',
    type: 'PRIMARY_DB',
    host: 'db-master.ap-south-1.fixbyte.internal',
    ipAddress: '10.240.12.18',
    region: 'ap-south-1 (Mumbai)',
    engine: 'PostgreSQL 16.4 Enterprise',
    status: 'NOMINAL',
    cpuUsage: 42.4,
    ramUsage: 68.2,
    diskUsage: 54.1,
    latencyMs: 3.4,
    activeConnections: 342,
    maxConnections: 1200,
    qps: 4820,
    uptime: '49d 14h 22m',
    slowQueryCount: 2,
    cacheHitRatio: 98.6,
    replicationLagMs: 0,
  },
  {
    id: 'node-pg-replica',
    name: 'fxb-db-postgres-read-replica-02',
    type: 'REPLICA_DB',
    host: 'db-read02.ap-south-1.fixbyte.internal',
    ipAddress: '10.240.12.19',
    region: 'ap-south-1 (Mumbai)',
    engine: 'PostgreSQL 16.4 Streaming Replica',
    status: 'NOMINAL',
    cpuUsage: 35.8,
    ramUsage: 61.5,
    diskUsage: 54.1,
    latencyMs: 2.1,
    activeConnections: 580,
    maxConnections: 1500,
    qps: 6410,
    uptime: '32d 08h 11m',
    slowQueryCount: 0,
    cacheHitRatio: 99.1,
    replicationLagMs: 8,
  },
  {
    id: 'node-redis-cache',
    name: 'fxb-cache-redis-cluster-01',
    type: 'CACHE_SERVER',
    host: 'redis-mesh.internal.fixbyte.io',
    ipAddress: '10.240.16.4',
    region: 'ap-south-1 (Mumbai)',
    engine: 'Redis Enterprise 7.2.4',
    status: 'NOMINAL',
    cpuUsage: 28.1,
    ramUsage: 78.4,
    diskUsage: 22.0,
    latencyMs: 0.65,
    activeConnections: 1840,
    maxConnections: 10000,
    qps: 18400,
    uptime: '112d 04h 50m',
    slowQueryCount: 0,
    cacheHitRatio: 99.4,
  },
  {
    id: 'node-app-worker-01',
    name: 'fxb-srv-compute-worker-us-east',
    type: 'APP_SERVER',
    host: 'worker-01.us-east.fixbyte.net',
    ipAddress: '10.120.44.102',
    region: 'us-east-1 (N. Virginia)',
    engine: 'Ubuntu 24.04 LTS / Node 22',
    status: 'WARNING',
    cpuUsage: 79.8,
    ramUsage: 82.3,
    diskUsage: 71.4,
    latencyMs: 28.5,
    activeConnections: 890,
    maxConnections: 1500,
    qps: 3200,
    uptime: '18d 02h 45m',
    slowQueryCount: 14,
  },
  {
    id: 'node-api-edge',
    name: 'fxb-gateway-edge-envoy-eu',
    type: 'API_GATEWAY',
    host: 'edge-eu-01.frankfurt.fixbyte.net',
    ipAddress: '10.180.08.55',
    region: 'eu-central-1 (Frankfurt)',
    engine: 'Envoy Gateway 1.30 / Linux',
    status: 'NOMINAL',
    cpuUsage: 31.0,
    ramUsage: 45.2,
    diskUsage: 19.8,
    latencyMs: 11.2,
    activeConnections: 2450,
    maxConnections: 8000,
    qps: 12900,
    uptime: '64d 19h 30m',
    slowQueryCount: 1,
  },
];

/**
 * Generate 20 historical data points for a baseline
 */
export function generateHistory(baseValue: number, variance: number, count = 20): { timestamp: number; value: number }[] {
  const points: { timestamp: number; value: number }[] = [];
  const now = Date.now();
  const step = 4000; // 4s intervals
  for (let i = count - 1; i >= 0; i--) {
    const jitter = (Math.random() - 0.5) * variance * 2;
    const val = Math.max(0, +(baseValue + jitter).toFixed(1));
    points.push({
      timestamp: now - i * step,
      value: val,
    });
  }
  return points;
}

/**
 * Initial Customizable Live Trackers
 */
export const INITIAL_TRACKERS: CustomTracker[] = [
  {
    id: 'track-01',
    title: 'Primary DB Query Execution Latency',
    metricType: 'QUERY_LATENCY',
    targetNodeId: 'node-pg-primary',
    targetNodeName: 'fxb-db-postgres-prod-01',
    chartType: 'area',
    unit: 'ms',
    refreshIntervalSec: 2,
    warningThreshold: 25,
    criticalThreshold: 80,
    alertAction: 'EMAIL',
    notificationTarget: 'fixbytesupports@gmail.com',
    enabled: true,
    isBuiltin: true,
    currentValue: 3.4,
    status: 'NOMINAL',
    notes: 'Monitors P95 query execution time across master schema read/write pool.',
    history: generateHistory(3.4, 1.8),
  },
  {
    id: 'track-02',
    title: 'Compute Cluster CPU Saturation',
    metricType: 'CPU_USAGE',
    targetNodeId: 'node-app-worker-01',
    targetNodeName: 'fxb-srv-compute-worker-us-east',
    chartType: 'area',
    unit: '%',
    refreshIntervalSec: 1,
    warningThreshold: 75,
    criticalThreshold: 90,
    alertAction: 'AUTO_THROTTLE',
    notificationTarget: 'FixByte Autoscaler Agent',
    enabled: true,
    isBuiltin: true,
    currentValue: 79.8,
    status: 'WARNING',
    notes: 'High load detected on background queue worker.',
    history: generateHistory(79.8, 6.5),
  },
  {
    id: 'track-03',
    title: 'Redis Shared Cache Hit Ratio',
    metricType: 'CACHE_HIT_RATIO',
    targetNodeId: 'node-redis-cache',
    targetNodeName: 'fxb-cache-redis-cluster-01',
    chartType: 'gauge',
    unit: '%',
    refreshIntervalSec: 2,
    warningThreshold: 92,
    criticalThreshold: 85,
    alertAction: 'SLACK',
    notificationTarget: '#fixbyte-ops-telemetry',
    enabled: true,
    isBuiltin: true,
    currentValue: 99.4,
    status: 'NOMINAL',
    notes: 'Ensures hot keys stay cached to avoid database hammering.',
    history: generateHistory(99.4, 0.4),
  },
  {
    id: 'track-04',
    title: 'Database Active Connection Pool Load',
    metricType: 'ACTIVE_CONNECTIONS',
    targetNodeId: 'GLOBAL',
    targetNodeName: 'Global Database Tier',
    chartType: 'bar',
    unit: 'conn',
    refreshIntervalSec: 5,
    warningThreshold: 2200,
    criticalThreshold: 3000,
    alertAction: 'WEBHOOK',
    notificationTarget: 'https://api.fixbyte.io/hooks/alerts',
    enabled: true,
    isBuiltin: true,
    currentValue: 922,
    status: 'NOMINAL',
    notes: 'Aggregated client connections across master and streaming replica pools.',
    history: generateHistory(922, 90),
  },
  {
    id: 'track-05',
    title: 'Edge Gateway API 5xx Error Rate',
    metricType: 'ERROR_RATE_5XX',
    targetNodeId: 'node-api-edge',
    targetNodeName: 'fxb-gateway-edge-envoy-eu',
    chartType: 'area',
    unit: '%',
    refreshIntervalSec: 2,
    warningThreshold: 1.5,
    criticalThreshold: 4.0,
    alertAction: 'EMAIL',
    notificationTarget: 'fixbytesupports@gmail.com',
    enabled: true,
    isBuiltin: false,
    currentValue: 0.12,
    status: 'NOMINAL',
    notes: 'Upstream gateway 502/503 response ratio per 10k requests.',
    history: generateHistory(0.12, 0.08),
  },
  {
    id: 'track-06',
    title: 'Postgres Streaming Replication Lag',
    metricType: 'REPLICATION_LAG',
    targetNodeId: 'node-pg-replica',
    targetNodeName: 'fxb-db-postgres-read-replica-02',
    chartType: 'area',
    unit: 'ms',
    refreshIntervalSec: 1,
    warningThreshold: 150,
    criticalThreshold: 500,
    alertAction: 'WEBHOOK',
    notificationTarget: 'https://ops.fixbyte.internal/lag-alarm',
    enabled: true,
    isBuiltin: false,
    currentValue: 8.0,
    status: 'NOMINAL',
    notes: 'Delta between master WAL write and replica commit flush.',
    history: generateHistory(8.0, 4.0),
  },
];

/**
 * Initial Audit Log events
 */
export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-101',
    timestamp: '2026-10-23 12:15:02',
    actorName: 'Vikram Sharma',
    actorRole: 'SUPER_ADMIN' as UserRole,
    action: 'CUSTOM_TRACKER_CREATED',
    target: 'Postgres Streaming Replication Lag',
    status: 'SUCCESS' as const,
    details: 'Configured new telemetry tracker with 1s refresh & 150ms warning trigger.',
  },
  {
    id: 'log-102',
    timestamp: '2026-10-23 11:42:19',
    actorName: 'Anya Patel',
    actorRole: 'DATABASE_ADMIN' as UserRole,
    action: 'VACUUM_ANALYZE_EXECUTED',
    target: 'fxb-db-postgres-prod-01',
    status: 'SUCCESS' as const,
    details: 'Routine query statistics re-index completed in 840ms. Reclaimed 1.4 GB dead tuples.',
  },
  {
    id: 'log-103',
    timestamp: '2026-10-23 10:05:44',
    actorName: 'Rahul Verma',
    actorRole: 'SRE_ENGINEER' as UserRole,
    action: 'SCALE_WORKER_POOL',
    target: 'fxb-srv-compute-worker-us-east',
    status: 'WARNING' as const,
    details: 'Allocated 2 additional burst vCPUs to mitigate queue backlog spike.',
  },
  {
    id: 'log-104',
    timestamp: '2026-10-23 09:20:11',
    actorName: 'Priya Rao',
    actorRole: 'SUPPORT_ANALYST' as UserRole,
    action: 'EXPORT_TELEMETRY_LOGS',
    target: 'Cloud Monitoring Dashboard',
    status: 'SUCCESS' as const,
    details: 'Downloaded snapshot JSON for Incident #FXB-8839.',
  },
];
