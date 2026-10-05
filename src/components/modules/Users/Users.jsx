import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Eye,
  MoreVertical,
  Plus,
  Landmark,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  FileText,
  Trash2,
  Users as UsersIcon,
  Sparkles,
  Lock
} from 'lucide-react';
import initialUsers from '../../../data/usersData.json';
import KpiCard from '../../common/KpiCard';
import { authorizeAction } from '../../../services/adminRbacService';

export default function Users({ globalSearch, currentRole }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Handle local or global search
  const effectiveSearch = globalSearch || searchTerm;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      u.connectedBroker.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      u.status.toUpperCase() === statusFilter.toUpperCase();

    const matchesRole =
      roleFilter === 'ALL' ||
      u.role.toUpperCase() === roleFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesRole;
  });

  const isReadOnly = currentRole?.id === 'ROLE_READ_ONLY';

  const toggleUserStatus = (userId) => {
    const auth = authorizeAction(currentRole, 'suspend_users', 'Suspend / Unsuspend User');
    if (!auth.success) {
      setActionSuccessMsg(`🔒 ${auth.message}`);
      setTimeout(() => setActionSuccessMsg(''), 4500);
      return;
    }
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
          const msg = `User ${user.name} is now ${newStatus}.`;
          setActionSuccessMsg(msg);
          setTimeout(() => setActionSuccessMsg(''), 3000);
          return { ...user, status: newStatus };
        }
        return user;
      })
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prev) => ({
        ...prev,
        status: prev.status === 'Active' ? 'Suspended' : 'Active'
      }));
    }
  };

  const confirmDeleteUser = (userId) => {
    const auth = authorizeAction(currentRole, 'manage_users', 'Delete User Account');
    if (!auth.success) {
      setActionSuccessMsg(`🔒 ${auth.message}`);
      setTimeout(() => setActionSuccessMsg(''), 4500);
      return;
    }
    const user = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setShowDeleteConfirmModal(false);
    setShowModal(false);
    setUserToDelete(null);
    setActionSuccessMsg(`User ${user?.name || userId} has been permanently deleted.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            User Management
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage retail traders, strategy creators, broker bindings & compliance.
          </p>
        </div>

        <button
          onClick={() => alert('Inviting new user / sending onboarding link...')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Summary Cards (Clickable Filter Controls) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Registered"
          value="12,480"
          icon={UsersIcon}
          color="slate"
          valueColor="text-slate-900"
          isActive={statusFilter === 'ALL' && roleFilter === 'ALL'}
          onClick={() => {
            setStatusFilter('ALL');
            setRoleFilter('ALL');
            setSearchTerm('');
          }}
          subtitle="Show all"
        />
        <KpiCard
          title="Active Today"
          value="9,850"
          change="+8.6%"
          icon={UserCheck}
          color="emerald"
          valueColor="text-emerald-600"
          isActive={statusFilter === 'ACTIVE'}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'ACTIVE' ? 'ALL' : 'ACTIVE'));
            setRoleFilter('ALL');
          }}
          subtitle="Filter active"
        />
        <KpiCard
          title="Marketplace Creators"
          value="184"
          change="+12"
          icon={Sparkles}
          color="blue"
          valueColor="text-blue-600"
          isActive={roleFilter === 'CREATOR'}
          onClick={() => {
            setRoleFilter((prev) => (prev === 'CREATOR' ? 'ALL' : 'CREATOR'));
            setStatusFilter('ALL');
          }}
          subtitle="Filter creators"
        />
        <KpiCard
          title="Suspended / Flagged"
          value="14"
          icon={AlertTriangle}
          color="rose"
          valueColor="text-rose-600"
          isActive={statusFilter === 'SUSPENDED'}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'SUSPENDED' ? 'ALL' : 'SUSPENDED'));
            setRoleFilter('ALL');
          }}
          subtitle="Filter flagged"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, user ID, broker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 p-1 bg-slate-100/70 rounded-full border border-slate-200/50">
          {['ALL', 'ACTIVE', 'SUSPENDED', 'PENDING KYC'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setRoleFilter('ALL');
              }}
              className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                statusFilter === status && roleFilter === 'ALL'
                  ? 'bg-[#111827] text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
              }`}
            >
              {status}
            </button>
          ))}
          {roleFilter === 'CREATOR' && (
            <button
              onClick={() => setRoleFilter('ALL')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Creators Only</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Plan</th>
                <th className="py-4 px-4">Connected Broker</th>
                <th className="py-4 px-4">KYC Status</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          user.role === 'Creator'
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{user.plan}</p>
                      <p className="text-[10px] text-slate-400">{user.planPrice}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.brokerStatus === 'Connected'
                              ? 'bg-emerald-500'
                              : user.brokerStatus === 'Token Expired'
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`}
                        />
                        <span className="font-medium text-slate-700">{user.connectedBroker}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.kycStatus === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : user.kycStatus === 'Pending Review'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={isReadOnly}
                          title={isReadOnly ? 'Read Only: Suspension action prohibited under BRD §13/§14' : ''}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            isReadOnly
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : user.status === 'Active'
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {isReadOnly ? '🔒 Locked' : user.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                        </button>

                        <button
                          onClick={() => {
                            if (!isReadOnly) {
                              setUserToDelete(user);
                              setShowDeleteConfirmModal(true);
                            }
                          }}
                          disabled={isReadOnly}
                          title={isReadOnly ? 'Read Only: Deletion action prohibited under BRD §13/§14' : 'Delete User'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isReadOnly
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal (Safe view: broker tokens masked as per BRD) */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                  {selectedUser.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.id} &bull; {selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 font-medium">Account Status</span>
                <p className="font-bold text-slate-900 mt-1">{selectedUser.status}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 font-medium">Subscription</span>
                <p className="font-bold text-slate-900 mt-1">{selectedUser.plan}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 font-medium">Connected Broker</span>
                <p className="font-bold text-slate-900 mt-1">{selectedUser.connectedBroker}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 font-medium">Active Deployments</span>
                <p className="font-bold text-indigo-600 mt-1">{selectedUser.activeDeployments} Strategies</p>
              </div>
            </div>

            {/* SEBI / Compliance Data Masking Notice */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Compliance Notice: Token Security
              </p>
              <p className="text-amber-700 leading-relaxed">
                Broker Auth Tokens and TOTP keys are encrypted at rest using KMS. Raw broker secrets are never exposed in the Admin Console.
              </p>
              <p className="font-mono text-slate-500 pt-1">
                Token Hash: <span className="text-slate-800">sha256:8f4c...91b2 (Active)</span>
              </p>
            </div>

            {/* Support notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Support & Compliance Notes</label>
              <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100">
                {selectedUser.supportNotes || 'No support notes recorded for this user.'}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={() => {
                  setUserToDelete(selectedUser);
                  setShowDeleteConfirmModal(true);
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => toggleUserStatus(selectedUser.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl text-white ${
                    selectedUser.status === 'Active'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {selectedUser.status === 'Active' ? 'Suspend User' : 'Unsuspend User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Trader Account?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-bold text-slate-800">{userToDelete.name}</span>{' '}
                  (<span className="font-mono text-slate-700">{userToDelete.id}</span>)?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200/60 rounded-2xl text-[11px] text-rose-800 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Irreversible Action
              </p>
              <ul className="list-disc list-inside space-y-1 text-rose-700 pl-0.5">
                <li>Revokes all connected broker authorization tokens ({userToDelete.connectedBroker}).</li>
                <li>Immediately halts all {userToDelete.activeDeployments} active strategy deployments.</li>
                <li>Purges subscription tier ({userToDelete.plan}) and trader history from TradeNova.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteUser(userToDelete.id)}
                className="px-5 py-2 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
