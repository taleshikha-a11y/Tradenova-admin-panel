import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound, Shield, CheckCircle2 } from 'lucide-react';

export default function AccessDenied({
  moduleName,
  currentRole,
  authorizedRoles = [],
  onReturnDashboard,
  onSwitchRole
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-lg w-full bg-white rounded-4xl p-8 border border-slate-100 shadow-card text-center space-y-6">
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header */}
        <div>
          <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            HTTP 403 &bull; Access Forbidden
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
            Module Access Restricted
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            SEBI Least-Privilege Architecture Enforcement (BRD §13 & §14)
          </p>
        </div>

        {/* Current Active Role Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Your Active Role</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#111827] text-white">
              {currentRole?.name || 'Unknown Role'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your role does not possess authorization to view or access the{' '}
            <strong className="text-slate-900 font-bold">{moduleName}</strong> module.
          </p>
        </div>

        {/* Authorized Roles List */}
        {authorizedRoles.length > 0 && (
          <div className="text-left space-y-2">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Permitted Administrative Roles For This Module:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {authorizedRoles.map((roleName, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{roleName}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReturnDashboard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          {onSwitchRole && (
            <button
              type="button"
              onClick={onSwitchRole}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Switch Active Role</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
