/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateMetricStatus,
  hasPermission,
  formatMetricValue,
  getMetricDirection,
  generateHistory,
} from './telemetry';

test('evaluateMetricStatus correctly detects nominal, warning, and critical for higher_is_worse metrics', () => {
  // Warning at 75, Critical at 90
  assert.equal(evaluateMetricStatus(40, 75, 90, 'higher_is_worse'), 'NOMINAL');
  assert.equal(evaluateMetricStatus(75, 75, 90, 'higher_is_worse'), 'WARNING');
  assert.equal(evaluateMetricStatus(82.4, 75, 90, 'higher_is_worse'), 'WARNING');
  assert.equal(evaluateMetricStatus(90, 75, 90, 'higher_is_worse'), 'CRITICAL');
  assert.equal(evaluateMetricStatus(99.9, 75, 90, 'higher_is_worse'), 'CRITICAL');
});

test('evaluateMetricStatus correctly handles lower_is_worse metrics like Cache Hit Ratio', () => {
  // For Cache Hit: warning if <= 92, critical if <= 85
  assert.equal(evaluateMetricStatus(99.5, 92, 85, 'lower_is_worse'), 'NOMINAL');
  assert.equal(evaluateMetricStatus(91.8, 92, 85, 'lower_is_worse'), 'WARNING');
  assert.equal(evaluateMetricStatus(84.0, 92, 85, 'lower_is_worse'), 'CRITICAL');
});

test('getMetricDirection returns correct orientation', () => {
  assert.equal(getMetricDirection('CACHE_HIT_RATIO'), 'lower_is_worse');
  assert.equal(getMetricDirection('CPU_USAGE'), 'higher_is_worse');
  assert.equal(getMetricDirection('QUERY_LATENCY'), 'higher_is_worse');
});

test('hasPermission enforces FixByte role-based access control accurately', () => {
  // SUPER_ADMIN has everything
  assert.equal(hasPermission('SUPER_ADMIN', 'MANAGE_SERVERS'), true);
  assert.equal(hasPermission('SUPER_ADMIN', 'TRIGGER_FAILOVER'), true);
  assert.equal(hasPermission('SUPER_ADMIN', 'MANAGE_USERS'), true);

  // DATABASE_ADMIN can manage DBs and failover, but cannot manage users
  assert.equal(hasPermission('DATABASE_ADMIN', 'MANAGE_DATABASES'), true);
  assert.equal(hasPermission('DATABASE_ADMIN', 'TRIGGER_FAILOVER'), true);
  assert.equal(hasPermission('DATABASE_ADMIN', 'MANAGE_USERS'), false);

  // SUPPORT_ANALYST is read-only / tracking customized view, cannot restart or failover
  assert.equal(hasPermission('SUPPORT_ANALYST', 'CUSTOMIZE_TRACKING'), true);
  assert.equal(hasPermission('SUPPORT_ANALYST', 'TRIGGER_FAILOVER'), false);
  assert.equal(hasPermission('SUPPORT_ANALYST', 'RESTART_SERVICES'), false);
  assert.equal(hasPermission('SUPPORT_ANALYST', 'MANAGE_USERS'), false);
});

test('formatMetricValue formats diverse units cleanly', () => {
  assert.equal(formatMetricValue(88.45, '%'), '88.5%');
  assert.equal(formatMetricValue(12.4, 'ms'), '12 ms');
  assert.equal(formatMetricValue(4500, 'qps'), '4,500 qps');
  assert.equal(formatMetricValue(240, 'conn'), '240 conn');
});

test('generateHistory generates exact requested sample count with positive timestamps', () => {
  const history = generateHistory(50, 10, 15);
  assert.equal(history.length, 15);
  assert.ok(history[0].timestamp > 0);
  assert.ok(history[history.length - 1].value >= 0);
});
