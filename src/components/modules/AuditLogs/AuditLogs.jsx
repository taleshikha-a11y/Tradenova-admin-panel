import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  Eye,
  Lock,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import initialLogs from '../../../data/auditLogsData.json';

export default function AuditLogs({ globalSearch }) {
  const [logs, setLogs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const effectiveSearch = globalSearch || searchTerm;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.entity.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.ip.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesAction =
      actionFilter === 'ALL' || log.action.toUpperCase().includes(actionFilter.toUpperCase());

    return matchesSearch && matchesAction;
  });

  const exportAudit = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'tradenova_audit_trail.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Immutable Audit Trail
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            SEBI & regulatory compliant tamper-evident records of all administrative & risk interventions.
          </p>
        </div>

        <button
          onClick={exportAudit}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Export Audit Trail (JSON)</span>
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-4 bg-indigo-50/60 rounded-3xl border border-indigo-100/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-2xl">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Cryptographically Chained Logs</h4>
            <p className="text-xs text-slate-500">
              Audit events are recorded in append-only storage with actor IP addresses and entity state hashes.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-full text-indigo-700 font-bold border border-indigo-100 hidden sm:inline-block">
          Integrity Verified: OK
        </span>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, action type, IP address, entity ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 p-1 bg-slate-100/70 rounded-full border border-slate-200/50">
          {['ALL', 'BROKER', 'USER', 'RISK', 'KILL_SWITCH', 'REFUND'].map((action) => (
            <button
              key={action}
              onClick={() => setActionFilter(action)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                actionFilter === action
                  ? 'bg-[#111827] text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-4 px-6">Timestamp & Log ID</th>
                <th className="py-4 px-4">Actor & Role</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4">Target Entity</th>
                <th className="py-4 px-4">Actor IP</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No audit records matching search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{log.timestamp}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{log.actor}</p>
                      <p className="text-[10px] text-slate-400">{log.role}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{log.entity}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {log.entityId}
                      </p>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">{log.ip}</td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                        title="View Full Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Audit Record: {selectedLog.id}</h3>
                <p className="text-xs text-slate-400">{selectedLog.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Actor:</span>
                  <span className="font-bold text-slate-900">{selectedLog.actor} ({selectedLog.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Action:</span>
                  <span className="font-bold text-indigo-600 font-mono">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Entity:</span>
                  <span className="font-bold text-slate-900">{selectedLog.entity} ({selectedLog.entityId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Originating IP:</span>
                  <span className="font-mono text-slate-700">{selectedLog.ip}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-1">Audit Details</h4>
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed font-mono text-[11px]">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
