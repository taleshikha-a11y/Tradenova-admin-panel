import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Shield,
  Layers,
  X,
  Megaphone,
  Lock
} from 'lucide-react';
import initialIncidents from '../../../data/incidentsData.json';
import { authorizeAction } from '../../../services/adminRbacService';

export default function Incidents({ currentRole }) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [notice, setNotice] = useState('');

  const isReadOnly = currentRole?.id === 'ROLE_READ_ONLY';

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const auth = authorizeAction(
      currentRole,
      'broadcast_alerts',
      'Broadcast System Outage Banner'
    );
    if (!auth.success) {
      setNotice(`🔒 ${auth.message}`);
      setTimeout(() => setNotice(''), 4500);
      return;
    }
    setBroadcastActive(true);
    setShowBroadcastModal(false);
    setNotice('Emergency broadcast pushed to all Web Trading Consoles and Mobile Apps.');
    setTimeout(() => setNotice(''), 4000);
  };

  const resolveIncident = (id) => {
    const auth = authorizeAction(currentRole, 'manage_incidents', `Resolve Incident ${id}`);
    if (!auth.success) {
      setNotice(`🔒 ${auth.message}`);
      setTimeout(() => setNotice(''), 4500);
      return;
    }
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...inc,
            status: 'Resolved',
            resolvedAt: `Today, ${nowTime} IST`,
            timeline: [
              ...inc.timeline,
              { time: nowTime, note: 'Incident resolved by Admin. Systems returned to nominal state.' }
            ]
          };
        }
        return inc;
      })
    );
    setNotice(`Incident ${id} marked as RESOLVED.`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Incidents & Operational Outages
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track service degradation, broker gateway drops, timeline post-mortems & broadcasts.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isReadOnly) setShowBroadcastModal(true);
          }}
          disabled={isReadOnly}
          title={
            isReadOnly
              ? 'Read Only: Broadcast alerts prohibited under BRD §13/§14'
              : 'Broadcast Platform Banner'
          }
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-xs transition-colors ${
            isReadOnly
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>{isReadOnly ? '🔒 Broadcast Restricted' : 'Broadcast Platform Banner'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Broadcast Banner if triggered */}
      {broadcastActive && (
        <div className="p-4 rounded-3xl bg-amber-500 text-white shadow-md flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 animate-pulse" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Active Live Announcement
              </p>
              <p className="text-sm font-bold">{broadcastMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setBroadcastActive(false)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors"
          >
            Dismiss Broadcast
          </button>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-soft text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">All Systems Nominal</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No active operational incidents or service degradations reported.
            </p>
          </div>
        ) : (
          incidents.map((inc) => (
          <div
            key={inc.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    inc.severity === 'Critical'
                      ? 'bg-rose-500 animate-ping'
                      : inc.severity === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{inc.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {inc.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Service: <span className="font-semibold text-slate-700">{inc.service}</span> &bull; Lead: {inc.owner}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    inc.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                  }`}
                >
                  {inc.status}
                </span>

                {inc.status !== 'Resolved' && (
                  <button
                    onClick={() => {
                      if (!isReadOnly) resolveIncident(inc.id);
                    }}
                    disabled={isReadOnly}
                    title={
                      isReadOnly
                        ? 'Read Only: Incident resolution prohibited under BRD §13/§14'
                        : 'Mark Resolved'
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      isReadOnly
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    }`}
                  >
                    {isReadOnly ? '🔒 Locked' : 'Mark Resolved'}
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{inc.summary}</p>

            {/* Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Incident Timeline & Telemetry
              </h4>
              <div className="space-y-2 pt-1">
                {inc.timeline.map((entry, eIdx) => (
                  <div key={eIdx} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-slate-400 font-bold shrink-0">{entry.time}</span>
                    <span className="text-slate-700 font-medium">{entry.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleBroadcast}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">
                  Broadcast Platform Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                This notice will appear instantly in the top banner across all active trader mobile apps, web consoles, and creator dashboards.
              </p>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Announcement Text
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. NSE market data latency restored to normal. All broker connections active."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
              >
                Push Broadcast
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
