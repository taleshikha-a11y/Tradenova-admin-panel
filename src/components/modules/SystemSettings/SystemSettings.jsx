import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  AlertTriangle,
  Save,
  RotateCcw,
  Zap,
  Radio,
  X,
  Users,
  KeyRound,
  Check,
  Minus,
  Sparkles,
  ArrowRight,
  Shield,
  Eye,
  RefreshCw,
  Crown
} from 'lucide-react';
import initialSettings from '../../../data/systemSettingsData.json';
import rolesData from '../../../data/rolesData.json';
import { authorizeAction } from '../../../services/adminRbacService';

const permissionCategories = [
  {
    id: 'safety_risk',
    title: 'Critical Safety & Risk Limits',
    subtitle: 'SEBI-mandated emergency kill switches, drawdown limits & order velocity thresholds',
    icon: ShieldAlert,
    badge: 'Critical High Impact',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    permissions: [
      {
        key: 'emergency_kill_switch',
        label: 'Emergency Kill Switch',
        description: 'Authorize global halt across all broker adapters (Zerodha, Angel, Upstox, etc.) and cancel all open limit/SL orders.',
        risk: 'High'
      },
      {
        key: 'configure_risk_limits',
        label: 'Configure Risk Engine Limits',
        description: 'Adjust maximum per-user drawdown, order velocity per second, and contract lot size ceilings.',
        risk: 'High'
      }
    ]
  },
  {
    id: 'user_compliance',
    title: 'Trader Accounts & SEBI Compliance',
    subtitle: 'Trader identity verification, Aadhaar/PAN KYC status, trader bans & immutable audit trails',
    icon: Users,
    badge: 'Governance',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    permissions: [
      {
        key: 'manage_users',
        label: 'User Management & Status',
        description: 'Verify Aadhaar/PAN KYC documentation, edit user profiles, and reset multi-factor authentication (2FA).',
        risk: 'Medium'
      },
      {
        key: 'suspend_users',
        label: 'Suspend / Unsuspend Users',
        description: 'Immediate account freeze preventing order placement due to margin deficit or compliance violations.',
        risk: 'High'
      },
      {
        key: 'view_audit_logs',
        label: 'Immutable Audit Trail Access',
        description: 'SEBI regulatory audit trail viewing (immutable IP address logs, timestamps, and action snapshots).',
        risk: 'Standard'
      }
    ]
  },
  {
    id: 'strategies_market',
    title: 'Strategy Marketplace & Algo Governance',
    subtitle: 'Algorithmic code vetting, indicator validation, backtest verification & public listing approvals',
    icon: Sliders,
    badge: 'Marketplace',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    permissions: [
      {
        key: 'review_strategies',
        label: 'Inspect Strategy Logic & PnL',
        description: 'Inspect strategy source logic, execution indicators, stop loss parameters, and historical backtest metrics.',
        risk: 'Standard'
      },
      {
        key: 'approve_strategies',
        label: 'Approve / Flag Marketplace Strategies',
        description: 'Publish verified strategies to public marketplace or flag non-compliant algorithmic models.',
        risk: 'Medium'
      }
    ]
  },
  {
    id: 'brokers_orders',
    title: 'Broker Adapters & Order Engine',
    subtitle: 'Broker API connections, order dispatch pipelines, retries & live error handling',
    icon: Zap,
    badge: 'Live Trading',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    permissions: [
      {
        key: 'manage_brokers',
        label: 'Toggle Broker Adapters',
        description: 'Enable or disable broker connectors (Zerodha, Angel One, Upstox, Dhan, Fyers) and health endpoints.',
        risk: 'High'
      },
      {
        key: 'route_orders',
        label: 'Live Order Execution Monitor',
        description: 'Live order routing stream, sub-millisecond execution logs, and order book matching.',
        risk: 'Standard'
      },
      {
        key: 'retry_orders',
        label: 'Retry / Requeue Orders',
        description: 'Manually re-dispatch rejected or timed-out orders during broker API volatility or connectivity drops.',
        risk: 'Medium'
      }
    ]
  },
  {
    id: 'finance_incidents',
    title: 'Billing, Ledgers & Incident Response',
    subtitle: 'Subscription gateways, refund disbursements, outage declaration & broadcast alerts',
    icon: Radio,
    badge: 'Finance & Ops',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    permissions: [
      {
        key: 'manage_payments',
        label: 'Payment & Subscription Plans',
        description: 'Manage platform pricing tiers, view transaction ledgers, and reconcile gateway webhooks.',
        risk: 'Medium'
      },
      {
        key: 'process_refunds',
        label: 'Process Refunds',
        description: 'Authorize and disburse customer subscription refunds through Razorpay / Stripe.',
        risk: 'High'
      },
      {
        key: 'manage_incidents',
        label: 'Incident & Outage Management',
        description: 'Declare system outages, document root-cause analysis (RCA), and assign engineer response tasks.',
        risk: 'Medium'
      },
      {
        key: 'broadcast_alerts',
        label: 'Broadcast System Outage Banners',
        description: 'Publish platform-wide alert notices displayed directly on active trader terminal headers.',
        risk: 'Medium'
      }
    ]
  }
];

export default function SystemSettings({
  killSwitchActive,
  setKillSwitchActive,
  currentRole,
  setCurrentRole,
  rolesList = rolesData.roles,
  onUpdateRolePermissions,
  onResetRolePermissions,
  onLogout
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [showKillConfirmModal, setShowKillConfirmModal] = useState(false);
  const [killConfirmInput, setKillConfirmInput] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState('access'); // 'roles' | 'access' | 'risk' | 'timings'

  const roles = rolesList || rolesData.roles;
  const { permissionLabels } = rolesData;

  // Target role whose permissions are being configured by Super Admin
  const [selectedTargetRoleId, setSelectedTargetRoleId] = useState('ROLE_OPERATIONS');

  const targetRole =
    roles.find((r) => r.id === selectedTargetRoleId) ||
    roles.find((r) => r.id === 'ROLE_OPERATIONS') ||
    roles[0];

  const [editedPermissions, setEditedPermissions] = useState(targetRole ? targetRole.permissions : []);

  // Synchronize edited permissions whenever the target role or roles list updates
  useEffect(() => {
    const found = roles.find((r) => r.id === selectedTargetRoleId);
    if (found) {
      setEditedPermissions(found.permissions);
    }
  }, [selectedTargetRoleId, rolesList]);

  const isSuperAdmin = currentRole?.id === 'ROLE_SUPER_ADMIN';

  const handleRiskChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      riskEngine: {
        ...prev.riskEngine,
        [field]: value
      }
    }));
  };

  const saveRiskConfig = (e) => {
    e.preventDefault();
    const auth = authorizeAction(
      currentRole,
      'configure_risk_limits',
      'Save Risk Engine Protection Thresholds'
    );
    if (!auth.success) {
      setNotice(`🔒 ${auth.message}`);
      setTimeout(() => setNotice(''), 4500);
      return;
    }
    setNotice('Risk engine parameters saved & propagated to live worker threads.');
    setTimeout(() => setNotice(''), 3500);
  };

  const triggerKillSwitch = () => {
    const auth = authorizeAction(
      currentRole,
      'emergency_kill_switch',
      'Trigger Global Emergency Kill Switch'
    );
    if (!auth.success) {
      setNotice(`🔒 ${auth.message}`);
      setShowKillConfirmModal(false);
      setTimeout(() => setNotice(''), 4500);
      return;
    }
    if (killConfirmInput !== 'STOP-TRADING') {
      alert('Confirmation text mismatch. Please type STOP-TRADING to authorize.');
      return;
    }
    setKillSwitchActive(true);
    setShowKillConfirmModal(false);
    setKillConfirmInput('');
    setNotice('GLOBAL KILL SWITCH ENGAGED! All open orders canceled & workers paused.');
    setTimeout(() => setNotice(''), 6000);
  };

  const resumeTrading = () => {
    setKillSwitchActive(false);
    setNotice('Trading resumed. Normal risk engine order evaluation restarted.');
    setTimeout(() => setNotice(''), 4000);
  };

  // Permission delegation handlers
  const handleTogglePermission = (permKey) => {
    if (!isSuperAdmin) {
      setNotice('🔒 Access Restricted: Only Super Admin has authority to grant or revoke administrative access.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }
    if (selectedTargetRoleId === 'ROLE_SUPER_ADMIN') {
      setNotice('Notice: Super Admin possesses immutable root privileges and cannot be restricted.');
      setTimeout(() => setNotice(''), 3000);
      return;
    }
    setEditedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  const handleGrantAll = () => {
    if (!isSuperAdmin) {
      setNotice('🔒 Restricted: Only Super Admin can modify administrative access.');
      setTimeout(() => setNotice(''), 3000);
      return;
    }
    const allKeys = Object.keys(permissionLabels);
    setEditedPermissions(allKeys);
    setNotice(`Granted all ${allKeys.length} system capabilities to ${targetRole.name}. Click "Save Delegated Access" to apply.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleRevokeAll = () => {
    if (!isSuperAdmin) {
      setNotice('🔒 Restricted: Only Super Admin can modify administrative access.');
      setTimeout(() => setNotice(''), 3000);
      return;
    }
    if (selectedTargetRoleId === 'ROLE_SUPER_ADMIN') {
      setNotice('Super Admin permissions cannot be revoked.');
      setTimeout(() => setNotice(''), 3000);
      return;
    }
    setEditedPermissions([]);
    setNotice(`Revoked all permissions from ${targetRole.name}. Click "Save Delegated Access" to apply.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleResetTargetToBRD = () => {
    const originalRole = rolesData.roles.find((r) => r.id === selectedTargetRoleId);
    if (originalRole) {
      setEditedPermissions(originalRole.permissions);
      if (onUpdateRolePermissions) {
        onUpdateRolePermissions(selectedTargetRoleId, originalRole.permissions);
      }
      setNotice(`Reset ${targetRole.name} to SEBI BRD §13 standard least-privilege permissions.`);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const handleSaveDelegation = () => {
    const auth = authorizeAction(
      currentRole,
      'emergency_kill_switch',
      'Delegate Administrative Permissions'
    );
    if (!auth.success) {
      setNotice(`🔒 ${auth.message}`);
      setTimeout(() => setNotice(''), 4500);
      return;
    }
    if (onUpdateRolePermissions) {
      onUpdateRolePermissions(selectedTargetRoleId, editedPermissions);
    }
    setNotice(`✓ Successfully saved ${editedPermissions.length} permissions for ${targetRole.name}! Propagated live across platform.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleTestLoginAsTarget = () => {
    setCurrentRole(targetRole);
    setNotice(`Active context switched to ${targetRole.name}. Test your permissions now.`);
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Tab Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            System Settings & Admin Roles
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            SEBI-compliant RBAC role governance, Super Admin access delegation & emergency controls.
          </p>
        </div>

        {/* Tab switcher matching CashPanel pill buttons */}
        <div className="bg-white/90 p-1.5 rounded-full border border-[#CFDEEB] flex items-center gap-1 shadow-xs flex-wrap">
          <button
            onClick={() => setActiveSettingsTab('access')}
            className={`px-4 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 ${
              activeSettingsTab === 'access'
                ? 'bg-[#111827] text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Grant Admin Access</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black">
              SUPER
            </span>
          </button>
          <button
            onClick={() => setActiveSettingsTab('roles')}
            className={`px-4 py-2 rounded-full text-xs transition-all ${
              activeSettingsTab === 'roles'
                ? 'bg-[#111827] text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
            }`}
          >
            Admin Roles (BRD)
          </button>
          <button
            onClick={() => setActiveSettingsTab('risk')}
            className={`px-4 py-2 rounded-full text-xs transition-all ${
              activeSettingsTab === 'risk'
                ? 'bg-[#111827] text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
            }`}
          >
            Risk Engine Limits
          </button>
          <button
            onClick={() => setActiveSettingsTab('timings')}
            className={`px-4 py-2 rounded-full text-xs transition-all ${
              activeSettingsTab === 'timings'
                ? 'bg-[#111827] text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
            }`}
          >
            Session Schedules
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: GRANT ADMIN ACCESS (SUPER ADMIN DELEGATION MODULE)       */}
      {/* ============================================================== */}
      {activeSettingsTab === 'access' && (
        <div className="space-y-6">
          {/* Super Admin Authorization Status Banner */}
          <div
            className={`p-5 rounded-3xl border shadow-card transition-all ${
              isSuperAdmin
                ? 'bg-gradient-to-r from-[#111827] to-[#1e293b] text-white border-transparent'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-md shrink-0 ${
                    isSuperAdmin ? 'bg-amber-400 text-slate-950' : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {isSuperAdmin ? '👑' : '🔒'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base">
                      {isSuperAdmin
                        ? 'Super Admin Access Delegation Center'
                        : 'View-Only Mode: Super Admin Delegation'}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSuperAdmin
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {isSuperAdmin ? 'Full Authorization' : 'Locked to Super Admin'}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 max-w-2xl leading-relaxed ${
                      isSuperAdmin ? 'text-slate-300' : 'text-amber-700'
                    }`}
                  >
                    {isSuperAdmin
                      ? 'You are authenticated as Master Super Admin. Select any subordinate admin role below and toggle exact module capabilities in accordance with SEBI Least-Privilege regulations.'
                      : `You are currently logged in as "${currentRole.name}". Under SEBI regulations, only the Super Admin can grant or revoke operational capabilities. Permission toggles are locked in view-only mode.`}
                  </p>
                </div>
              </div>

              {!isSuperAdmin && onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-full bg-[#111827] text-white hover:bg-black text-xs font-bold transition-all shadow-md shrink-0"
                >
                  Sign In as Super Admin &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Role Selection Bar (Which role is Super Admin configuring?) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Step 1: Select Admin Role To Delegate Access
                </p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  Choose which administrative team you want to grant or revoke capabilities for:
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                {roles.length} Roles Registered
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {roles.map((r) => {
                const isSelected = selectedTargetRoleId === r.id;
                const permCount = r.permissions.length;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedTargetRoleId(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#111827] bg-[#111827] text-white shadow-md ring-2 ring-[#111827]/10'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-black truncate">{r.name}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-semibold truncate ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {r.badge}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40">
                        <span
                          className={`text-[9px] font-bold ${
                            isSelected ? 'text-amber-300' : 'text-blue-600'
                          }`}
                        >
                          {permCount}/14 Active
                        </span>
                        {r.id === 'ROLE_SUPER_ADMIN' && (
                          <span className="text-[8px] font-bold uppercase bg-amber-400 text-slate-950 px-1 rounded">
                            Master
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Target Role Overview & Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  <KeyRound className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Configuring Access: {targetRole.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                      {targetRole.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {editedPermissions.length} of 14 Capabilities Enabled
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                    {targetRole.description}
                  </p>
                </div>
              </div>

              {/* Quick Actions for Super Admin */}
              <div className="flex items-center gap-2 flex-wrap">
                {isSuperAdmin && targetRole.id !== 'ROLE_SUPER_ADMIN' && (
                  <>
                    <button
                      type="button"
                      onClick={handleGrantAll}
                      className="px-3.5 py-2 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      onClick={handleRevokeAll}
                      className="px-3.5 py-2 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                    >
                      Revoke All
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTargetToBRD}
                      className="px-3.5 py-2 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to BRD Standards</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleTestLoginAsTarget}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#111827] text-white hover:bg-black transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Test As This Role</span>
                </button>
              </div>
            </div>

            {/* If Super Admin role is selected, inform that it cannot be modified */}
            {targetRole.id === 'ROLE_SUPER_ADMIN' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong>Master Root Protection:</strong> Super Admin has unalterable master
                  authorization across all 14 platform capabilities. Permissions cannot be removed
                  from the Super Admin account to prevent administrative lockout.
                </span>
              </div>
            )}
          </div>

          {/* Categorized Permissions Toggles */}
          <div className="space-y-5">
            {permissionCategories.map((cat) => {
              const Icon = cat.icon;
              const activeCountInCat = cat.permissions.filter((p) =>
                editedPermissions.includes(p.key)
              ).length;
              const totalInCat = cat.permissions.length;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-card space-y-4"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {cat.title}
                          </h4>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeColor}`}
                          >
                            {cat.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{cat.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        {activeCountInCat} of {totalInCat} Granted
                      </span>
                    </div>
                  </div>

                  {/* Permissions Rows */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {cat.permissions.map((perm) => {
                      const isGranted = editedPermissions.includes(perm.key);
                      const isTargetSuper = targetRole.id === 'ROLE_SUPER_ADMIN';

                      return (
                        <div
                          key={perm.key}
                          onClick={() => {
                            if (!isTargetSuper && isSuperAdmin) {
                              handleTogglePermission(perm.key);
                            }
                          }}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-4 select-none ${
                            isGranted
                              ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                              : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                          } ${
                            isSuperAdmin && !isTargetSuper
                              ? 'cursor-pointer hover:shadow-xs'
                              : 'cursor-not-allowed opacity-90'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Custom Switch Toggle */}
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                                  isGranted ? 'bg-emerald-600' : 'bg-slate-300'
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                    isGranted ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                                  {perm.label}
                                </h5>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    perm.risk === 'High'
                                      ? 'bg-rose-100 text-rose-700'
                                      : perm.risk === 'Medium'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {perm.risk} Risk
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {perm.description}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span
                              className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                                isGranted
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                            >
                              {isGranted ? 'GRANTED' : 'RESTRICTED'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Save Action Bar */}
          <div className="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#111827] text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Access Delegation For: <span className="text-blue-600">{targetRole.name}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {editedPermissions.length} of 14 System Capabilities Assigned &bull; SEBI Least
                  Privilege Compliant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetTargetToBRD}
                className="px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
              >
                Reset to BRD Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveDelegation}
                disabled={!isSuperAdmin || targetRole.id === 'ROLE_SUPER_ADMIN'}
                className="px-6 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save Delegated Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADMIN ROLES & RBAC MATRIX (BRD Page 10 & 11)             */}
      {/* ============================================================== */}
      {activeSettingsTab === 'roles' && (
        <div className="space-y-6">
          {/* Super Admin Access Delegation Callout Banner */}
          <div className="bg-gradient-to-r from-[#111827] to-[#1e293b] text-white p-5 sm:p-6 rounded-3xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                👑
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Super Admin Access Delegation Module
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Configure what capabilities Super Admin delegates to Operations, Compliance,
                  Support, Finance, or Read Only roles.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSettingsTab('access')}
              className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <span>Configure Admin Access Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Role Banner */}
          <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#111827] text-white flex items-center justify-center font-bold">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900">
                    Current Active Role: {currentRole?.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {currentRole?.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  {currentRole?.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">BRD Compliance</p>
              <p className="text-xs font-bold text-emerald-600">Least Privilege by Default</p>
            </div>
          </div>

          {/* 6 BRD Admin Roles Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => {
              const isSelected = currentRole?.id === role.id;
              const switchThisRole = () => {
                setCurrentRole(role);
                setNotice(`Switched active context to ${role.name}.`);
                setTimeout(() => setNotice(''), 3000);
              };

              return (
                <div
                  key={role.id}
                  onClick={switchThisRole}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      switchThisRole();
                    }
                  }}
                  className={`group bg-white rounded-3xl p-5 border shadow-card flex flex-col justify-between transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl active:scale-[0.99] select-none ${
                    isSelected
                      ? 'ring-2 ring-[#111827] border-transparent bg-slate-50/30'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          {role.name}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-[#111827] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {role.description}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Permitted Actions ({role.permissions.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {role.permissions.slice(0, 4).map((perm, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded-md text-[10px] font-semibold text-slate-700"
                          >
                            {permissionLabels[perm] || perm}
                          </span>
                        ))}
                        {role.permissions.length > 4 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                            +{role.permissions.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTargetRoleId(role.id);
                        setActiveSettingsTab('access');
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <span>Configure Access</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        switchThisRole();
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#111827] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-[#111827] hover:text-white text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active Role' : 'Switch Role'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Permissions Matrix Table matching BRD */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Role-Based Access Control (RBAC) Permission Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Document Reference: Tradetron-Style Algo Trading Platform BRD Page 10 & 11
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-6">Administrative Capability</th>
                    <th className="py-3 px-3 text-center">Super Admin</th>
                    <th className="py-3 px-3 text-center">Operations</th>
                    <th className="py-3 px-3 text-center">Compliance</th>
                    <th className="py-3 px-3 text-center">Support</th>
                    <th className="py-3 px-3 text-center">Finance</th>
                    <th className="py-3 px-3 text-center">Read Only</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-6 font-bold text-slate-800">{label}</td>
                      {roles.map((r) => {
                        const hasPerm = r.permissions.includes(key);
                        return (
                          <td key={r.id} className="py-3 px-3 text-center">
                            {hasPerm ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-300">
                                <Minus className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: RISK ENGINE LIMITS & EMERGENCY KILL SWITCH          */}
      {/* ============================================================== */}
      {activeSettingsTab === 'risk' && (
        <div className="space-y-6">
          {/* Emergency Kill Switch Card */}
          <div
            className={`rounded-3xl p-6 sm:p-7 border shadow-card transition-all duration-300 ${
              killSwitchActive
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-2xl ${
                      killSwitchActive ? 'bg-rose-600 text-white' : 'bg-[#111827] text-white'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Global Emergency Kill Switch
                    </h3>
                    <p className="text-xs text-slate-400">
                      SEBI Mandated Operational Fail-Safe Mechanism (BRD Page 10 & 11)
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Instantly halts all automated order routing across all connected broker adapters
                  (Zerodha, Angel One, Upstox, Dhan, Fyers), cancels all pending limit/SL orders, and
                  prevents strategies from issuing new buy/sell intents.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      killSwitchActive
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        killSwitchActive ? 'bg-white' : 'bg-emerald-500'
                      }`}
                    />
                    {killSwitchActive ? 'TRADING HALTED GLOBALLY' : 'Engine Running Normally'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {killSwitchActive ? (
                  <button
                    onClick={resumeTrading}
                    className="px-6 py-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95"
                  >
                    RESUME TRADING ENGINE
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (
                        currentRole.id !== 'ROLE_SUPER_ADMIN' &&
                        currentRole.id !== 'ROLE_OPERATIONS'
                      ) {
                        alert(
                          'Access Denied: Only Super Admin and Operations can trigger the Global Kill Switch.'
                        );
                        return;
                      }
                      setShowKillConfirmModal(true);
                    }}
                    className="px-6 py-3 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    TRIGGER EMERGENCY KILL SWITCH
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Risk Engine Limits Form */}
          <form
            onSubmit={saveRiskConfig}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-card space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  SEBI Risk Engine Protection Thresholds
                </h3>
                <p className="text-xs text-slate-400">
                  Global limits enforced across all paper & live broker orders
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#111827] text-white hover:bg-black transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto"
              >
                <Save className="w-4 h-4" />
                Save Risk Limits
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Max Drawdown Per Day (₹)
                </label>
                <input
                  type="number"
                  value={settings.riskEngine.maxDrawdownPerDay}
                  onChange={(e) => handleRiskChange('maxDrawdownPerDay', Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  Halt trader strategy if MTM drops beyond this limit
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Max Open Positions / User
                </label>
                <input
                  type="number"
                  value={settings.riskEngine.maxOpenPositionsPerUser}
                  onChange={(e) =>
                    handleRiskChange('maxOpenPositionsPerUser', Number(e.target.value))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  Prevents margin spike on multi-leg option strategies
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Max Orders / Second (Broker Throttle)
                </label>
                <input
                  type="number"
                  value={settings.riskEngine.maxOrdersPerSecond}
                  onChange={(e) =>
                    handleRiskChange('maxOrdersPerSecond', Number(e.target.value))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  Broker API rate limit throttle protection
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Max Single Order Value (₹)
                </label>
                <input
                  type="number"
                  value={settings.riskEngine.maxSingleOrderValue}
                  onChange={(e) =>
                    handleRiskChange('maxSingleOrderValue', Number(e.target.value))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  Fat-finger safety threshold on single market/limit order
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Circuit Breaker Slippage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.riskEngine.circuitBreakerSlippagePercent}
                  onChange={(e) =>
                    handleRiskChange('circuitBreakerSlippagePercent', Number(e.target.value))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  Cancel order if execution deviates from trigger price
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Auto Square-off Time (IST)
                </label>
                <input
                  type="text"
                  value={settings.riskEngine.autoSquareOffTime}
                  onChange={(e) => handleRiskChange('autoSquareOffTime', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  SEBI intraday MIS square-off execution trigger
                </p>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: SESSION SCHEDULES & TIMINGS                         */}
      {/* ============================================================== */}
      {activeSettingsTab === 'timings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Indian Exchange Trading Sessions (BRD §5 & §6)
            </h3>
            <p className="text-xs text-slate-500">
              Platform state transitions follow National Stock Exchange (NSE) & Multi Commodity
              Exchange (MCX) timings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Pre-Open Session</p>
                <p className="text-lg font-extrabold text-slate-900 font-mono mt-1">09:00 - 09:08</p>
                <p className="text-[10px] text-slate-500 mt-1">Order collection & equilibrium price</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[11px] font-bold text-emerald-600 uppercase">Normal Equity/F&O</p>
                <p className="text-lg font-extrabold text-emerald-800 font-mono mt-1">09:15 - 15:30</p>
                <p className="text-[10px] text-emerald-700 mt-1">Live algorithmic continuous matching</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[11px] font-bold text-amber-600 uppercase">Intraday Square-off</p>
                <p className="text-lg font-extrabold text-amber-800 font-mono mt-1">15:15 IST</p>
                <p className="text-[10px] text-amber-700 mt-1">Automatic MIS/CO position closing</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-[11px] font-bold text-purple-600 uppercase">Commodity (MCX)</p>
                <p className="text-lg font-extrabold text-purple-800 font-mono mt-1">09:00 - 23:30</p>
                <p className="text-[10px] text-purple-700 mt-1">Evening commodity trading window</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Operational Trading Modes
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-800">Live Broker Order Routing</p>
                  <p className="text-[10px] text-slate-400">Permit orders to live exchanges</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-800">Paper Trading Simulator</p>
                  <p className="text-[10px] text-slate-400">Virtual balance simulation engine</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kill Switch Safeguard Modal */}
      {showKillConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Authorize Emergency Stop</h3>
                <p className="text-xs text-rose-500 font-medium">Critical Administrative Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will cancel all open orders across 6 broker adapters and pause strategy evaluation immediately.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">
                To confirm, type <span className="text-rose-600 font-mono">STOP-TRADING</span> below:
              </label>
              <input
                type="text"
                placeholder="STOP-TRADING"
                value={killConfirmInput}
                onChange={(e) => setKillConfirmInput(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-2xl font-mono text-center tracking-wider text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 uppercase"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowKillConfirmModal(false);
                  setKillConfirmInput('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerKillSwitch}
                className="px-5 py-2.5 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white"
              >
                CONFIRM EMERGENCY STOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
