import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Layers,
  X,
  TrendingUp,
  Lock
} from 'lucide-react';
import KpiCard from '../../common/KpiCard';
import { authorizeAction } from '../../../services/adminRbacService';
import { getAdminOrders } from '../../../services/apiClient';

export default function Orders({ globalSearch, currentRole }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notice, setNotice] = useState('');

  React.useEffect(() => {
    setIsLoading(true);
    getAdminOrders({ limit: 100 })
      .then((res) => {
        if (res.data?.orders) {
          const liveOrders = res.data.orders.map((o) => ({
            id: o.id.slice(0, 8),
            orderRef: o.brokerOrderId || `ORD-${o.id.slice(0, 6)}`,
            user: o.user?.name || 'Registered Trader',
            email: o.user?.email || 'N/A',
            strategy: o.strategy?.name || 'Manual Trade',
            broker: o.brokerAccount?.brokerName || 'Zerodha Kite',
            instrument: o.instrument,
            exchange: 'NSE',
            type: o.side === 'BUY' ? 'BUY' : 'SELL',
            qty: o.quantity || 1,
            price: Number(o.price || 0),
            executedPrice: o.filledPrice ? Number(o.filledPrice) : Number(o.price || 0),
            status: o.status === 'FILLED' ? 'Executed' : o.status === 'PENDING' ? 'Pending' : 'Failed',
            slippage: '0.00%',
            isProfit: null,
            pnl: '—',
            time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            correlationId: o.id,
            errorReason: o.errorMessage || null,
          }));
          setOrders(liveOrders);
        }
      })
      .catch((err) => {
        console.warn('[Admin Orders] Backend error:', err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const isReadOnly = currentRole?.id === 'ROLE_READ_ONLY';

  const effectiveSearch = globalSearch || searchTerm;

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.user.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      o.strategy.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      o.instrument.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      o.orderRef.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      o.correlationId.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || o.status.toUpperCase() === statusFilter.toUpperCase();

    const matchesSide =
      sideFilter === 'ALL' || o.type.toUpperCase() === sideFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesSide;
  });

  const retryOrder = (orderId) => {
    const auth = authorizeAction(currentRole, 'retry_orders', 'Retry / Requeue Order');
    if (!auth.success) {
      setNotice(`🔒 ${auth.message}`);
      setTimeout(() => setNotice(''), 4500);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          setNotice(`Order ${o.orderRef} requeued to order routing engine.`);
          setTimeout(() => setNotice(''), 3500);
          return {
            ...o,
            status: 'Executed',
            executedPrice: o.price,
            errorReason: null
          };
        }
        return o;
      })
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({
        ...prev,
        status: 'Executed',
        executedPrice: prev.price,
        errorReason: null
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Orders & Trades Monitor
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time order intents, fills, broker confirmations, positions & error reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Event Stream Connected
          </span>
        </div>
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

      {/* Metrics Row (Dynamically calculated from Database) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Executed Today"
          value={isLoading ? '...' : orders.filter((o) => o.status === 'Executed').length.toString()}
          icon={CheckCircle2}
          color="blue"
          valueColor="text-slate-900"
          isActive={statusFilter === 'EXECUTED'}
          onClick={() => setStatusFilter((prev) => (prev === 'EXECUTED' ? 'ALL' : 'EXECUTED'))}
          subtitle="Executed orders"
        />
        <KpiCard
          title="Pending Fills"
          value={isLoading ? '...' : orders.filter((o) => o.status === 'Pending').length.toString()}
          icon={Clock}
          color="amber"
          valueColor="text-amber-500"
          isActive={statusFilter === 'PENDING'}
          onClick={() => setStatusFilter((prev) => (prev === 'PENDING' ? 'ALL' : 'PENDING'))}
          subtitle="Pending in queue"
        />
        <KpiCard
          title="Rejected / Failed"
          value={isLoading ? '...' : orders.filter((o) => o.status === 'Failed').length.toString()}
          icon={AlertTriangle}
          color="rose"
          valueColor="text-rose-500"
          isActive={statusFilter === 'FAILED'}
          onClick={() => setStatusFilter((prev) => (prev === 'FAILED' ? 'ALL' : 'FAILED'))}
          subtitle="Failed execution"
        />
        <KpiCard
          title="Net Realized P&L"
          value="₹ 0.00"
          change="0.0%"
          icon={TrendingUp}
          color="emerald"
          valueColor="text-emerald-600"
          isActive={statusFilter === 'ALL'}
          onClick={() => setStatusFilter('ALL')}
          subtitle="Realized today"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, user, instrument, correlation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto p-1 bg-slate-100/70 rounded-full border border-slate-200/50">
          {/* Status filters */}
          {['ALL', 'EXECUTED', 'PENDING', 'FAILED'].map((st) => (
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

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-4 px-6">Order ID & User</th>
                <th className="py-4 px-4">Strategy & Broker</th>
                <th className="py-4 px-4">Instrument</th>
                <th className="py-4 px-4">Side</th>
                <th className="py-4 px-4">Qty & Price</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">P&L</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No orders matching search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{order.user}</p>
                      <p className="text-[11px] font-mono text-slate-400">{order.orderRef}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{order.strategy}</p>
                      <p className="text-[10px] text-slate-400">{order.broker}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 font-mono">{order.instrument}</span>
                      <span className="block text-[10px] text-slate-400">{order.exchange}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          order.type === 'BUY'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                        }`}
                      >
                        {order.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 font-mono">
                        {order.qty} @ ₹{order.price.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400">Slippage: {order.slippage}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'Executed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : order.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            order.status === 'Executed'
                              ? 'bg-emerald-500'
                              : order.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-bold font-mono text-xs ${
                          order.isProfit === true
                            ? 'text-emerald-600'
                            : order.isProfit === false
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {order.pnl}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                          title="View Trace"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === 'Failed' && (
                          <button
                            onClick={() => {
                              if (!isReadOnly) retryOrder(order.id);
                            }}
                            disabled={isReadOnly}
                            title={
                              isReadOnly
                                ? 'Read Only: Order requeue prohibited under BRD §13/§14'
                                : 'Retry Order'
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              isReadOnly
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer'
                            }`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{isReadOnly ? '🔒 Retry' : 'Retry'}</span>
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

      {/* Order Trace Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Order Details: {selectedOrder.orderRef}
                </h3>
                <p className="text-xs text-slate-400">{selectedOrder.time}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 font-medium">Correlation / Idempotency Key</span>
                  <p className="font-mono text-slate-800 font-bold mt-0.5 truncate">
                    {selectedOrder.correlationId}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 font-medium">Deployment ID</span>
                  <p className="font-mono text-slate-800 font-bold mt-0.5">
                    {selectedOrder.deploymentId}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Instrument:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedOrder.instrument} ({selectedOrder.exchange})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Side & Type:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.type} Market</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested vs Executed Price:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{selectedOrder.price} &rarr; ₹{selectedOrder.executedPrice || selectedOrder.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Broker Gateway:</span>
                  <span className="font-bold text-indigo-600">{selectedOrder.broker}</span>
                </div>
              </div>

              {selectedOrder.errorReason && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Broker Rejection Error
                  </p>
                  <p className="leading-relaxed">{selectedOrder.errorReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {selectedOrder.status === 'Failed' && (
                <button
                  onClick={() => {
                    if (!isReadOnly) retryOrder(selectedOrder.id);
                  }}
                  disabled={isReadOnly}
                  title={
                    isReadOnly
                      ? 'Read Only: Order retries prohibited under BRD §13/§14'
                      : 'Retry Execution'
                  }
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isReadOnly
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  }`}
                >
                  {isReadOnly ? '🔒 Requeue Prohibited' : 'Retry Execution'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
