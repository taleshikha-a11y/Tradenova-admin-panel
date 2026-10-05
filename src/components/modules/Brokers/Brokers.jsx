import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Shield,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Sliders,
  AlertCircle,
  Bell,
  X,
  Lock
} from 'lucide-react';
import initialBrokers from '../../../data/brokersData.json';
import { authorizeAction } from '../../../services/adminRbacService';

export default function Brokers({ currentRole }) {
  const [brokers, setBrokers] = useState(initialBrokers);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);

  const isReadOnly = currentRole?.id === 'ROLE_READ_ONLY';

  const toggleAdapter = (id) => {
    const auth = authorizeAction(currentRole, 'manage_brokers', 'Toggle Broker Adapter');
    if (!auth.success) {
      setNoticeMessage(`🔒 ${auth.message}`);
      setTimeout(() => setNoticeMessage(''), 4500);
      return;
    }
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newState = !b.adapterEnabled;
          setNoticeMessage(
            `Broker Adapter ${b.name} is now ${newState ? 'ENABLED' : 'PAUSED'}.`
          );
          setTimeout(() => setNoticeMessage(''), 4000);
          return {
            ...b,
            adapterEnabled: newState,
            status: newState ? 'Operational' : 'Disabled'
          };
        }
        return b;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Broker Adapters & API Health
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage multi-broker connectivity, OAuth/TOTP lifecycle, latency & circuit breakers.
          </p>
        </div>

        <button
          onClick={() => alert('Checking API ping latency across all broker gateways...')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-indigo-600" />
          <span>Ping All Adapters</span>
        </button>
      </div>

      {noticeMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage('')}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Broker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brokers.map((broker) => (
          <div
            key={broker.id}
            className={`bg-white rounded-3xl p-6 border shadow-card flex flex-col justify-between transition-all duration-300 ${
              broker.adapterEnabled
                ? 'border-slate-100 hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/80'
                : 'border-slate-200 bg-slate-50/50 opacity-90 hover:shadow-md'
            }`}
          >
            <div>
              {/* Header: Name, code, toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 font-black text-sm">
                    {broker.code.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {broker.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">{broker.code}</span>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => {
                    if (!isReadOnly) toggleAdapter(broker.id);
                  }}
                  disabled={isReadOnly}
                  title={
                    isReadOnly
                      ? 'Read Only: Broker adapter mutations prohibited under BRD §13/§14'
                      : broker.adapterEnabled
                      ? 'Disable Adapter'
                      : 'Enable Adapter'
                  }
                  className={`transition-transform focus:outline-none ${
                    isReadOnly ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
                  }`}
                >
                  {broker.adapterEnabled ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Outage banner if present */}
              {broker.outageBanner && (
                <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-tight">{broker.outageBanner}</span>
                </div>
              )}

              {/* Status and Latency pills */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    broker.status === 'Operational'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : broker.status === 'Degraded'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      broker.status === 'Operational'
                        ? 'bg-emerald-500 animate-pulse'
                        : broker.status === 'Degraded'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  {broker.status}
                </span>

                <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-md text-[11px] font-mono">
                  {broker.latency}
                </span>
              </div>

              {/* Metrics Box */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Connected Accounts:</span>
                  <span className="font-bold text-slate-800">
                    {broker.connectedUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Failure / Reject Rate:</span>
                  <span
                    className={`font-bold font-mono ${
                      parseFloat(broker.failureRate) > 0.5
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {broker.failureRate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Flow:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[150px]">
                    {broker.authMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Config Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Synced {broker.lastSync}</span>
              <button
                onClick={() => {
                  setSelectedBroker(broker);
                  setShowConfigModal(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adapter Config</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broker Adapter Config Drawer/Modal */}
      {showConfigModal && selectedBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
                  {selectedBroker.code.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedBroker.name} Settings
                  </h3>
                  <p className="text-xs text-slate-400">Adapter ID: {selectedBroker.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold">Rate Limit Threshold</span>
                <p className="font-bold text-slate-800">{selectedBroker.rateLimit}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold">Authentication Protocol</span>
                <p className="font-bold text-slate-800">{selectedBroker.authMethod}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Broadcast Outage Notice to Active Traders
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional notice message to display on traders' dashboard..."
                  defaultValue={selectedBroker.outageBanner || ''}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 text-amber-800 text-[11px] leading-relaxed">
                <strong>Emergency Safeguard:</strong> Disabling this adapter will immediately pause pending order routing for its {selectedBroker.connectedUsers} accounts. Existing open broker positions must be managed or squared off manually.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setNoticeMessage(`Updated configuration for ${selectedBroker.name}.`);
                  setTimeout(() => setNoticeMessage(''), 3000);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
