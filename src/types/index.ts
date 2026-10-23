/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'DEVOPS_LEAD'
  | 'DATABASE_ADMIN'
  | 'SRE_ENGINEER'
  | 'SUPPORT_ANALYST';

export type Permission =
  | 'MANAGE_SERVERS'
  | 'MANAGE_DATABASES'
  | 'CUSTOMIZE_TRACKING'
  | 'RESTART_SERVICES'
  | 'TRIGGER_FAILOVER'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_USERS'
  | 'EXECUTE_QUERIES'
  | 'TERMINATE_CONNECTIONS';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  status: 'ACTIVE' | 'ON_CALL' | 'OFFLINE';
  lastActive: string;
  apiKey: string;
  twoFactorEnabled: boolean;
}

export type NodeType =
  | 'PRIMARY_DB'
  | 'REPLICA_DB'
  | 'APP_SERVER'
  | 'CACHE_SERVER'
  | 'API_GATEWAY';

export type HealthStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';

export interface ServerNode {
  id: string;
  name: string;
  type: NodeType;
  host: string;
  ipAddress: string;
  region: string;
  engine: string;
  status: HealthStatus;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  latencyMs: number;
  activeConnections: number;
  maxConnections: number;
  qps: number;
  uptime: string;
  slowQueryCount: number;
  cacheHitRatio?: number;
  replicationLagMs?: number;
}

export type TrackerMetricType =
  | 'CPU_USAGE'
  | 'RAM_USAGE'
  | 'DISK_IOPS'
  | 'QUERY_LATENCY'
  | 'ACTIVE_CONNECTIONS'
  | 'REPLICATION_LAG'
  | 'CACHE_HIT_RATIO'
  | 'ERROR_RATE_5XX'
  | 'THROUGHPUT_QPS';

export interface CustomTracker {
  id: string;
  title: string;
  metricType: TrackerMetricType;
  targetNodeId: string; // 'GLOBAL' or node id
  targetNodeName: string;
  chartType: 'area' | 'bar' | 'gauge';
  unit: string;
  refreshIntervalSec: number;
  warningThreshold: number;
  criticalThreshold: number;
  alertAction: 'WEBHOOK' | 'EMAIL' | 'SLACK' | 'AUTO_THROTTLE';
  notificationTarget: string;
  enabled: boolean;
  isBuiltin?: boolean;
  history: { timestamp: number; value: number }[];
  currentValue: number;
  status: HealthStatus;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  details: string;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'WARNING' | 'CRITICAL';
  metricTitle: string;
  nodeName: string;
  currentValue: number;
  threshold: number;
  unit: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}
