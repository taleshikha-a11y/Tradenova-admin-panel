import React, { useState } from 'react';
import {
  LayoutGrid,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  CheckCircle2,
  Users,
  Activity,
  CreditCard,
  Eye as EyeIcon
} from 'lucide-react';
import rolesData from '../../../data/rolesData.json';

const roleAccounts = [
  {
    roleId: 'ROLE_SUPER_ADMIN',
    name: 'Vikramaditya Singhania',
    roleName: 'Super Admin',
    email: 'superadmin@tradenova.io',
    badge: 'Full Access',
    color: 'indigo',
    icon: Shield,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'Unrestricted authority, Emergency Kill Switch, Risk limits & RBAC'
  },
  {
    roleId: 'ROLE_OPERATIONS',
    name: 'Rajesh Kulkarni',
    roleName: 'Operations',
    email: 'operations@tradenova.io',
    badge: 'Execution & Adapters',
    color: 'blue',
    icon: Activity,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    description: 'Broker connectivity, order queue lag & live retries'
  },
  {
    roleId: 'ROLE_COMPLIANCE',
    name: 'Meera Nambiar',
    roleName: 'Compliance / Review',
    email: 'compliance@tradenova.io',
    badge: 'SEBI & Approvals',
    color: 'purple',
    icon: ShieldCheck,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    description: 'Marketplace strategy approval, KYC & audit logs'
  },
  {
    roleId: 'ROLE_SUPPORT',
    name: 'Ananya Deshmukh',
    roleName: 'Support',
    email: 'support@tradenova.io',
    badge: 'Customer Desk',
    color: 'emerald',
    icon: Users,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    description: 'User ticket assistance & masked broker token status'
  },
  {
    roleId: 'ROLE_FINANCE',
    name: 'Suresh Iyer',
    roleName: 'Finance',
    email: 'finance@tradenova.io',
    badge: 'Billing & Ledgers',
    color: 'amber',
    icon: CreditCard,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    description: 'Payment webhooks, subscriptions, invoices & refunds'
  },
  {
    roleId: 'ROLE_READ_ONLY',
    name: 'Kavita Menon',
    roleName: 'Read Only',
    email: 'auditor@tradenova.io',
    badge: 'Auditor View',
    color: 'slate',
    icon: EyeIcon,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    description: 'View-only access to charts & logs; zero mutation controls'
  }
];

export default function Login({ onLogin, rolesList = rolesData.roles }) {
  const [selectedAccount, setSelectedAccount] = useState(roleAccounts[0]);
  const [email, setEmail] = useState(roleAccounts[0].email);
  const [password, setPassword] = useState('TradeNova@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('849201');
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (acc) => {
    setSelectedAccount(acc);
    setEmail(acc.email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Find the corresponding role object from rolesList
    const matchedRole =
      rolesList.find((r) => r.id === selectedAccount.roleId) || rolesList[0];

    const profileData = {
      name: selectedAccount.name,
      email: email,
      phone: '+91 98201 00000',
      address: 'Plot C-59, G Block, BKC Financial Center',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      country: 'India',
      avatar: selectedAccount.avatar,
      roleName: matchedRole.name
    };

    setTimeout(() => {
      setLoading(false);
      onLogin(matchedRole, profileData);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#D8E4EE] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-4xl p-6 sm:p-9 shadow-card border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-13 h-13 rounded-3xl bg-[#111827] text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">TradeNova</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Role-Based Admin Authentication (BRD §13 & §14)
          </p>
        </div>

        {/* Role Selector Header */}
        <div className="mb-5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Select Admin Role To Sign In:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {roleAccounts.map((acc) => {
              const isSelected = selectedAccount.roleId === acc.roleId;
              const Icon = acc.icon;
              return (
                <button
                  type="button"
                  key={acc.roleId}
                  onClick={() => handleSelectRole(acc)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#111827] bg-[#111827] text-white shadow-sm ring-2 ring-[#111827]/10 scale-[1.02]'
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-extrabold truncate ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {acc.roleName}
                    </span>
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-blue-400' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-semibold truncate ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {acc.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Context Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-[#EDF3F8] border border-[#CFDEEB] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={selectedAccount.avatar}
              alt={selectedAccount.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedAccount.name}
                </p>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0">
                  {selectedAccount.roleName}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                {selectedAccount.description}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Assigned Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="admin@tradenova.io"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Security Password</label>
              <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                KMS Auth Verified
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              2FA TOTP (BRD §14 Compliance)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full font-mono text-center tracking-widest text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="6-digit TOTP"
              />
            </div>
          </div>

          {/* Dark Pill Submit Button matching CashPanel theme */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-full bg-[#111827] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-3"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In as {selectedAccount.roleName}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Least Privilege by Default &bull; Immutable Audit Logs Active
          </p>
        </div>
      </div>
    </div>
  );
}
