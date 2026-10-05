import React from 'react';
import {
  LayoutGrid,
  Users,
  Layers,
  Landmark,
  ArrowLeftRight,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';
import { MODULE_ACCESS_POLICY } from '../../services/adminRbacService';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  currentRole,
  adminProfile
}) {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'strategies', label: 'Strategies', icon: Layers },
    { id: 'brokers', label: 'Brokers', icon: Landmark },
    { id: 'orders', label: 'Orders & Trades', icon: ArrowLeftRight },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'settings', label: 'Settings & Roles', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-[#E3EDF6] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#111827] flex items-center justify-center text-white shadow-md">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                TradeNova
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 -mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation list matching user's exact dark rounded pill button */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-1.5">
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Platform Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPermitted =
            !MODULE_ACCESS_POLICY[item.id] ||
            MODULE_ACCESS_POLICY[item.id].includes(currentRole?.id);

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              title={!isPermitted ? `Restricted to authorized roles under BRD §13/§14` : item.label}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs sm:text-sm transition-all group ${
                isActive
                  ? 'bg-[#111827] text-white shadow-md font-bold'
                  : isPermitted
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-white'
                      : isPermitted
                      ? 'text-slate-400 group-hover:text-slate-700'
                      : 'text-slate-300'
                  }`}
                />
                <span className={!isPermitted ? 'opacity-80' : ''}>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {!isPermitted && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-400">
                    🔒
                  </span>
                )}
                {item.badge && isPermitted && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.alert
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* User profile footer */}
      <div className="p-3.5 border-t border-[#E3EDF6] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={adminProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={adminProfile?.name || 'Admin'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#CFDEEB] shrink-0"
          />
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate">
              {adminProfile?.name || 'Admin User'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              {adminProfile?.email || 'admin@tradenova.com'}
            </p>
          </div>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0 ml-1" />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar: Permanently pinned to screen (Never scrolls away!) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full border-r border-[#CFDEEB] bg-white z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* 2. Mobile/Tablet Off-Canvas Overlay & Drawer (< lg screens) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
