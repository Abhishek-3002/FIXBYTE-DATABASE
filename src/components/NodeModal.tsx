/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Server, Database, Plus } from 'lucide-react';
import { NodeType, ServerNode } from '../types';

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (newNode: Partial<ServerNode>) => void;
}

export const NodeModal: React.FC<NodeModalProps> = ({
  isOpen,
  onClose,
  onAddNode,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<NodeType>('PRIMARY_DB');
  const [host, setHost] = useState('');
  const [ipAddress, setIpAddress] = useState('10.240.20.5');
  const [region, setRegion] = useState('ap-south-1 (Mumbai)');
  const [engine, setEngine] = useState('PostgreSQL 16.4 Enterprise');
  const [maxConnections, setMaxConnections] = useState(1500);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNode({
      name: name.trim() || 'fxb-custom-node-01',
      type,
      host: host.trim() || `${name.toLowerCase()}.fixbyte.internal`,
      ipAddress: ipAddress.trim() || '10.240.20.10',
      region,
      engine,
      status: 'NOMINAL',
      cpuUsage: +(15 + Math.random() * 20).toFixed(1),
      ramUsage: +(30 + Math.random() * 25).toFixed(1),
      diskUsage: +(20 + Math.random() * 15).toFixed(1),
      latencyMs: +(1.2 + Math.random() * 4).toFixed(1),
      activeConnections: Math.floor(100 + Math.random() * 200),
      maxConnections: Number(maxConnections) || 1500,
      qps: Math.floor(2000 + Math.random() * 3000),
      uptime: '1d 04h 12m',
      slowQueryCount: 0,
      cacheHitRatio: type === 'CACHE_SERVER' ? 99.2 : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register Node or Cluster</h3>
              <p className="text-xs text-slate-400">Attach new server instance or database to FixByte monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Node Identifier / Hostname <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. fxb-db-analytics-replica-03"
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Node Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NodeType)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="PRIMARY_DB">Primary Database</option>
                <option value="REPLICA_DB">Streaming Read Replica</option>
                <option value="CACHE_SERVER">Redis Cache Cluster</option>
                <option value="APP_SERVER">Application Worker Server</option>
                <option value="API_GATEWAY">Edge API Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Internal IP Address
              </label>
              <input
                type="text"
                required
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="10.240.20.15"
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cloud Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai)</option>
                <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt)</option>
                <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Engine / Runtime
              </label>
              <input
                type="text"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                placeholder="e.g. PostgreSQL 16.4 Enterprise"
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs"
            >
              Register & Begin Polling
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
