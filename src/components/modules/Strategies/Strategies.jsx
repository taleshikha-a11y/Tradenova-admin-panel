import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
  AlertTriangle,
  TrendingUp,
  Percent,
  Shield,
  Clock,
  ArrowUpRight,
  Filter,
  Check,
  X,
  Users,
  Lock
} from 'lucide-react';
import initialStrategies from '../../../data/strategiesData.json';
import { authorizeAction } from '../../../services/adminRbacService';

export default function Strategies({ globalSearch, currentRole }) {
  const [strategies, setStrategies] = useState(initialStrategies);
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [notification, setNotification] = useState('');

  const isReadOnly = currentRole?.id === 'ROLE_READ_ONLY';

  const effectiveSearch = globalSearch || searchTerm;

  const filtered = strategies.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.creator.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      item.category.toUpperCase().includes(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const toggleFeatured = (id) => {
    const auth = authorizeAction(currentRole, 'approve_strategies', 'Feature / Unfeature Strategy');
    if (!auth.success) {
      notify(`🔒 ${auth.message}`);
      return;
    }
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = !s.featured;
          notify(`"${s.name}" is ${updated ? 'now Featured' : 'unfeatured'}.`);
          return { ...s, featured: updated };
        }
        return s;
      })
    );
  };

  const updateReviewStatus = (id, newStatus) => {
    const auth = authorizeAction(
      currentRole,
      'approve_strategies',
      `Set Strategy Review Status to ${newStatus}`
    );
    if (!auth.success) {
      notify(`🔒 ${auth.message}`);
      return;
    }
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          notify(`Strategy "${s.name}" marked as ${newStatus}.`);
          return {
            ...s,
            reviewStatus: newStatus,
            status: newStatus === 'Approved' ? 'Active' : 'Suspended'
          };
        }
        return s;
      })
    );
    setShowReviewModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Strategy Management
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Review no-code algorithms, approve marketplace listings & monitor deployment safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-2xl flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            1 Strategy Awaiting Review
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search strategy by name, creator, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 p-1 bg-slate-100/70 rounded-full border border-slate-200/50">
          {['ALL', 'EQUITY', 'F&O', 'CRYPTO'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#111827] text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card hover:shadow-xl hover:-translate-y-1.5 hover:border-indigo-200/80 transition-all duration-300 flex flex-col justify-between relative group"
          >
            {/* Top row */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {item.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">By {item.creator}</p>
                </div>

                <button
                  onClick={() => toggleFeatured(item.id)}
                  title={item.featured ? 'Featured in Marketplace' : 'Mark as Featured'}
                  className={`p-1.5 rounded-xl transition-colors ${
                    item.featured
                      ? 'text-amber-500 bg-amber-50'
                      : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                  }`}
                >
                  <Star className={`w-4 h-4 ${item.featured ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                {item.description}
              </p>

              {/* Status and Category badges */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {item.category}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    item.reviewStatus === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : item.reviewStatus === 'Pending Approval'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  {item.reviewStatus}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  {item.pricing}
                </span>
              </div>

              {/* Performance Stats Pill Box */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl mb-4 text-center">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Win Rate</p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{item.winRate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Mo. Return</p>
                  <p className="text-xs font-black text-emerald-600 mt-0.5">{item.monthlyReturn}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Max DD</p>
                  <p className="text-xs font-black text-slate-700 mt-0.5">{item.maxDrawdown}</p>
                </div>
              </div>
            </div>

            {/* Bottom action row */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                <span className="font-bold text-slate-700">{item.subscribers.toLocaleString()}</span> subscribers
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedStrategy(item);
                    setShowReviewModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors"
                >
                  Inspect & Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Review & Inspection Modal */}
      {showReviewModal && selectedStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedStrategy.name}</h3>
                <p className="text-xs text-slate-400">Version {selectedStrategy.version} &bull; Author: {selectedStrategy.creator}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 mb-1">Strategy Logic & Summary</h4>
                <p className="p-3 bg-slate-50 rounded-2xl text-slate-600 leading-relaxed">
                  {selectedStrategy.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 font-medium">Instruments Covered</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedStrategy.instruments.join(', ')}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 font-medium">Capital Required</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedStrategy.capitalRequired}</p>
                </div>
              </div>

              {/* SEBI Compliance Checklist according to BRD Page 12/17 */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Compliance & Safety Acceptance Checklist
                </p>
                <ul className="space-y-1.5 text-indigo-950 font-medium text-[11px]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Backtest simulation does not guarantee future live returns disclaimer present
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Maximum slippage and stop-loss rules validated by Risk Engine
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    No unbounded market order loops in condition schema
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Current Status: <span className="text-slate-800">{selectedStrategy.reviewStatus}</span>
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!isReadOnly) updateReviewStatus(selectedStrategy.id, 'Flagged');
                  }}
                  disabled={isReadOnly}
                  title={isReadOnly ? 'Read Only: Strategy rejection disabled under BRD §13/§14' : ''}
                  className={`px-4 py-2 text-xs font-bold rounded-xl ${
                    isReadOnly
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {isReadOnly ? '🔒 Read Only' : 'Reject / Flag'}
                </button>
                <button
                  onClick={() => {
                    if (!isReadOnly) updateReviewStatus(selectedStrategy.id, 'Approved');
                  }}
                  disabled={isReadOnly}
                  title={isReadOnly ? 'Read Only: Strategy approval disabled under BRD §13/§14' : ''}
                  className={`px-4 py-2 text-xs font-bold rounded-xl ${
                    isReadOnly
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isReadOnly ? '🔒 Prohibited' : 'Approve for Marketplace'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
