/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HealthStatus } from '../types';

interface SparklineChartProps {
  data: { timestamp: number; value: number }[];
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  status: HealthStatus;
  height?: number;
  showThresholds?: boolean;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  warningThreshold,
  criticalThreshold,
  unit,
  status,
  height = 70,
  showThresholds = true,
}) => {
  if (!data || data.length < 2) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center text-xs text-slate-500 font-mono"
      >
        Collecting telemetry...
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, criticalThreshold * 1.05, 10);
  const range = maxVal - minVal || 1;

  const width = 300;
  const paddingY = 8;
  const plotHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - paddingY - ((d.value - minVal) / range) * plotHeight;
    return { x, y, value: d.value };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  // Threshold Y positions
  const warningY = height - paddingY - ((warningThreshold - minVal) / range) * plotHeight;
  const criticalY = height - paddingY - ((criticalThreshold - minVal) / range) * plotHeight;

  // Determine line color based on status
  let strokeColor = '#22d3ee'; // cyan-400
  let gradientId = 'cyanGradient';

  if (status === 'CRITICAL') {
    strokeColor = '#f43f5e'; // rose-500
    gradientId = 'roseGradient';
  } else if (status === 'WARNING') {
    strokeColor = '#fbbf24'; // amber-400
    gradientId = 'amberGradient';
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Warning threshold dotted line */}
        {showThresholds && warningY >= 0 && warningY <= height && (
          <line
            x1="0"
            y1={warningY}
            x2={width}
            y2={warningY}
            stroke="#f59e0b"
            strokeDasharray="2,3"
            strokeWidth="1"
            opacity="0.6"
          />
        )}

        {/* Critical threshold dotted line */}
        {showThresholds && criticalY >= 0 && criticalY <= height && (
          <line
            x1="0"
            y1={criticalY}
            x2={width}
            y2={criticalY}
            stroke="#f43f5e"
            strokeDasharray="2,3"
            strokeWidth="1"
            opacity="0.75"
          />
        )}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Main Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulsing latest point */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3.5"
            fill={strokeColor}
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};
