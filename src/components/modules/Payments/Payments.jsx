import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  RotateCcw,
  Shield,
  Download,
  Check,
  X,
  Landmark,
  TrendingUp,
  Lock
} from 'lucide-react';
import KpiCard from '../../common/KpiCard';
import { authorizeAction } from '../../../services/adminRbacService';

export default function Payments({ globalSearch, currentRole }) {
  const [data, setData] = useState({
    summary: {
      totalRevenue: '₹ 0',
      monthlyRecurring: '₹ 0',
      successfulTxns: 0,
      totalRefunds: '₹ 0'
    },
    pricingPlans: [
      { id: 'standard', name: 'Standard Algo', price: '₹ 999/mo', subscribers: 0, features: ['Up to 3 Active Deployments', '1 Broker Connection', '10 Backtests / Day', 'Real-time Alerts'] },
      { id: 'pro', name: 'Pro Algo Plan', price: '₹ 1,999/mo', subscribers: 0, features: ['Up to 10 Active Deployments', '3 Broker Connections', 'Unlimited Backtesting', 'Priority Worker Queue'] },
      { id: 'creator', name: 'Creator Pro', price: '₹ 4,999/mo', subscribers: 0, features: ['Marketplace Publishing', 'Subscriber Analytics', 'Custom Webhooks', 'Dedicated Account Manager'] }
    ],
    transactions: []
  });
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notice, setNotice] = useState('');

  const isReadOnly = currentRole?.id === 'ROLE_READ_ONLY';

  const effectiveSearch = globalSearch || searchTerm;

  const filteredTxns = data.transactions.filter((t) => {
    const matchesSearch =
      t.user.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.gatewayRef.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || t.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const processRefund = (txnId) => {
    const auth = authorizeAction(
      currentRole,
      'process_refunds',
      `Authorize Refund for Transaction ${txnId}`
    );
    if (!auth.success) {
      setNotice(`🔒 ${auth.message}`);
      setTimeout(() => setNotice(''), 4500);
      return;
    }
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => {
        if (t.id === txnId) {
          setNotice(`Refund for ${t.id} (${t.amount}) marked as Processed via Razorpay webhook.`);
          setTimeout(() => setNotice(''), 3500);
          return { ...t, status: 'Refunded' };
        }
        return t;
      })
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Payments & Subscription Management
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Reconcile gateway webhooks, manage tier entitlements, transactions & refunds.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting monthly GST & subscription ledger CSV...')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Export Ledger</span>
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

      {/* Financial Metrics (Clickable Filter Controls) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={data.summary.totalRevenue}
          icon={Landmark}
          color="slate"
          valueColor="text-slate-900"
          isActive={statusFilter === 'ALL' && !searchTerm}
          onClick={() => {
            setStatusFilter('ALL');
            setSearchTerm('');
          }}
          subtitle="Show all"
        />
        <KpiCard
          title="Monthly Recurring (MRR)"
          value={data.summary.monthlyRecurring}
          icon={CreditCard}
          color="purple"
          valueColor="text-indigo-600"
          isActive={searchTerm === 'Plan'}
          onClick={() => {
            setSearchTerm((prev) => (prev === 'Plan' ? '' : 'Plan'));
            setStatusFilter('ALL');
          }}
          subtitle="Filter plan subs"
        />
        <KpiCard
          title="Successful Txns"
          value={data.summary.successfulTxns}
          icon={CheckCircle2}
          color="emerald"
          valueColor="text-emerald-600"
          isActive={statusFilter === 'COMPLETED'}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'COMPLETED' ? 'ALL' : 'COMPLETED'));
            setSearchTerm('');
          }}
          subtitle="Filter completed"
        />
        <KpiCard
          title="Total Refunds"
          value={data.summary.refundedAmount}
          icon={RotateCcw}
          color="rose"
          valueColor="text-rose-600"
          isActive={statusFilter === 'REFUNDED'}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'REFUNDED' ? 'ALL' : 'REFUNDED'));
            setSearchTerm('');
          }}
          subtitle="Filter refunds"
        />
      </div>

      {/* Subscription Plans Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.plans.map((p, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                <span className="text-sm font-extrabold text-indigo-600">{p.price}</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 font-semibold">
                {p.subscribers.toLocaleString()} active subscribers
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
                {p.features.map((f, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
              <span>Webhook Signature: Enforced</span>
              <span className="text-emerald-600 font-bold">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table & Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search transaction ID, customer, payment ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-slate-100/70 rounded-full border border-slate-200/50">
          {['ALL', 'SUCCESS', 'PENDING', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                statusFilter === st
                  ? 'bg-[#111827] text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-4">User</th>
                <th className="py-4 px-4">Plan & Amount</th>
                <th className="py-4 px-4">Gateway</th>
                <th className="py-4 px-4">Webhook Signed</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No transactions matching filter.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 font-mono">{t.id}</p>
                      <p className="text-[10px] text-slate-400">{t.date}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{t.user}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{t.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{t.amount}</p>
                      <p className="text-[10px] text-slate-400">{t.plan}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-700">{t.gateway}</span>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        {t.gatewayRef}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.webhookVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {t.webhookVerified ? 'Verified' : 'Pending Signature'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : t.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert(`Viewing Tax Invoice ${t.invoice}`)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {t.status === 'Success' && (
                          <button
                            onClick={() => {
                              if (!isReadOnly) processRefund(t.id);
                            }}
                            disabled={isReadOnly}
                            title={
                              isReadOnly
                                ? 'Read Only: Refund disbursement prohibited under BRD §13/§14'
                                : 'Process Refund'
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              isReadOnly
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 cursor-pointer'
                            }`}
                          >
                            <span>{isReadOnly ? '🔒 Refund' : 'Refund'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
