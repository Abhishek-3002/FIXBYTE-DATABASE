/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Shield, Lock, Key, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { Employee, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentEmployee: Employee;
  onSelectEmployee: (employee: Employee) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentEmployee,
  onSelectEmployee,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = employees.find((emp) => emp.email.toLowerCase() === emailInput.trim().toLowerCase());
    if (matched) {
      onSelectEmployee(matched);
      onClose();
    } else {
      setErrorMessage(`No FixByte personnel found matching "${emailInput}". Click one of the authorized profiles below.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">FixByte Identity & Access Gate</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Persona Switcher for Evaluation & Demonstrating Access Control */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Employee Role to Test Access Controls
          </label>
          <div className="space-y-2">
            {employees.map((emp) => {
              const isSelected = emp.id === currentEmployee.id;

              return (
                <button
                  key={emp.id}
                  onClick={() => {
                    onSelectEmployee(emp);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-cyan-400 font-normal">
                            (Active Session)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400">
                        {emp.role.replace('_', ' ')} · {emp.department}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Or enter custom credentials */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">
            Authenticate with FixByte Enterprise SSO
          </div>
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="operator@fixbyte.io"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            {errorMessage && (
              <p className="text-xs text-rose-400">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono font-semibold border border-slate-700 transition-colors"
            >
              Verify SSO Security Token
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
