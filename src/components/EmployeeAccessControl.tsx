/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  Check,
  X,
  Plus,
  Copy,
  Lock,
  UserCheck,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { Employee, Permission, UserRole } from '../types';
import { ROLE_PERMISSIONS, hasPermission } from '../utils/telemetry';

interface EmployeeAccessControlProps {
  employees: Employee[];
  currentEmployee: Employee;
  onSwitchEmployee: (employee: Employee) => void;
  onAddEmployee: (newEmployee: Partial<Employee>) => void;
  onUpdateRole: (employeeId: string, newRole: UserRole) => void;
}

const ALL_PERMISSIONS: { key: Permission; label: string; desc: string }[] = [
  { key: 'MANAGE_SERVERS', label: 'Manage Server Fleet', desc: 'Provision, configure, and decommission server nodes' },
  { key: 'MANAGE_DATABASES', label: 'Manage Databases', desc: 'Create databases, manage schemas and clusters' },
  { key: 'CUSTOMIZE_TRACKING', label: 'Customize Live Tracking', desc: 'Add/edit custom telemetry trackers & alert thresholds' },
  { key: 'RESTART_SERVICES', label: 'Restart Node Services', desc: 'Gracefully restart containers and cluster daemons' },
  { key: 'TRIGGER_FAILOVER', label: 'Trigger HA Failover', desc: 'Promote streaming read replicas to primary master' },
  { key: 'EXECUTE_QUERIES', label: 'Execute Sandbox Queries', desc: 'Run read/write statements in SQL query sandbox' },
  { key: 'TERMINATE_CONNECTIONS', label: 'Kill Rogue Queries', desc: 'Force terminate connection PIDs and locking sessions' },
  { key: 'VIEW_AUDIT_LOGS', label: 'Access Audit Logs', desc: 'Inspect security event history and operator actions' },
  { key: 'MANAGE_USERS', label: 'Manage Employee RBAC', desc: 'Invite staff, edit security roles and rotate API keys' },
];

export const EmployeeAccessControl: React.FC<EmployeeAccessControlProps> = ({
  employees,
  currentEmployee,
  onSwitchEmployee,
  onAddEmployee,
  onUpdateRole,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('DevOps Engineering');
  const [newRole, setNewRole] = useState<UserRole>('SRE_ENGINEER');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const canManageUsers = hasPermission(currentEmployee.role, 'MANAGE_USERS');

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDepartment,
      status: 'ACTIVE',
      lastActive: 'Just invited',
      apiKey: `fxb_live_sec_${Math.random().toString(36).substring(2, 12)}`,
      twoFactorEnabled: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
    });
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
                FixByte Zero-Trust RBAC
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {employees.length} Authorized Engineers
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Employee Access Control & Security Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Strict role-based access control (RBAC). Restricts critical actions like database failover, query termination, and server restarts to authorized roles.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!canManageUsers}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Employee Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Impersonation / Test Notice */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>
            Current Active Session: <strong className="text-white">{currentEmployee.name}</strong> ({currentEmployee.role.replace('_', ' ')})
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">Quick Test Switch:</span>
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => onSwitchEmployee(emp)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                currentEmployee.id === emp.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {emp.name.split(' ')[0]} ({emp.role === 'SUPER_ADMIN' ? 'Admin' : emp.role === 'DATABASE_ADMIN' ? 'DBA' : emp.role === 'SRE_ENGINEER' ? 'SRE' : 'Support'})
            </button>
          ))}
        </div>
      </div>

      {/* Employee Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Authorized Employees & Personnel</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {employees.filter((e) => e.twoFactorEnabled).length} / {employees.length} 2FA Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role & Access Tier</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status & 2FA</th>
                <th className="py-3 px-4">Agent API Key</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map((emp) => {
                const isCurrent = emp.id === currentEmployee.id;

                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Employee info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-300">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{emp.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono font-normal px-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 font-mono text-[11px]">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-3.5 px-4">
                      {canManageUsers && !isCurrent ? (
                        <select
                          value={emp.role}
                          onChange={(e) => onUpdateRole(emp.id, e.target.value as UserRole)}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                        >
                          <option value="SUPER_ADMIN">SUPER ADMIN</option>
                          <option value="DEVOPS_LEAD">DEVOPS LEAD</option>
                          <option value="DATABASE_ADMIN">DATABASE ADMIN</option>
                          <option value="SRE_ENGINEER">SRE ENGINEER</option>
                          <option value="SUPPORT_ANALYST">SUPPORT ANALYST</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] font-semibold border border-slate-700">
                          {emp.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-300">{emp.department}</td>

                    {/* Status & 2FA */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {emp.status}
                        </span>
                        {emp.twoFactorEnabled && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            2FA-OK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* API Key */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
                          {emp.apiKey.slice(0, 14)}...
                        </span>
                        <button
                          onClick={() => handleCopyKey(emp.apiKey, emp.id)}
                          title="Copy API key"
                          className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        >
                          {copiedKeyId === emp.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSwitchEmployee(emp)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                      >
                        {isCurrent ? 'Active' : 'Switch Role'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Role-Based Access Control (RBAC) Permission Matrix</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Detailed capability mapping across operational security tiers.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">System Permission</th>
                <th className="py-2.5 px-3 text-center">Super Admin</th>
                <th className="py-2.5 px-3 text-center">DevOps Lead</th>
                <th className="py-2.5 px-3 text-center">DBA</th>
                <th className="py-2.5 px-3 text-center">SRE</th>
                <th className="py-2.5 px-3 text-center">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-800/20">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{perm.label}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{perm.desc}</div>
                  </td>
                  {(['SUPER_ADMIN', 'DEVOPS_LEAD', 'DATABASE_ADMIN', 'SRE_ENGINEER', 'SUPPORT_ANALYST'] as UserRole[]).map(
                    (role) => {
                      const allowed = ROLE_PERMISSIONS[role].includes(perm.key);
                      return (
                        <td key={role} className="py-2.5 px-3 text-center">
                          {allowed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-950 text-slate-600">
                              <span className="w-1.5 h-0.5 bg-slate-700 rounded-full" />
                            </span>
                          )}
                        </td>
                      );
                    }
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Grant Employee Access</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Meera Nambiar"
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  FixByte Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. meera.n@fixbyte.io"
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Assignment
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN (Full Root Permissions)</option>
                  <option value="DEVOPS_LEAD">DEVOPS LEAD</option>
                  <option value="DATABASE_ADMIN">DATABASE ADMIN (DBA)</option>
                  <option value="SRE_ENGINEER">SRE ENGINEER</option>
                  <option value="SUPPORT_ANALYST">SUPPORT ANALYST (Read Only)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Provision Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
