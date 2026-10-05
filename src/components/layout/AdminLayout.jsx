import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  killSwitchActive,
  currentRole,
  setCurrentRole,
  rolesList,
  adminProfile,
  setAdminProfile,
  onLogout,
  children
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="h-screen w-screen max-w-full flex overflow-hidden bg-[#D8E4EE] font-sans">
      {/* Sidebar: Permanently pinned on desktop (stays visible during scrolling, zero overlap) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        currentRole={currentRole}
        rolesList={rolesList}
        adminProfile={adminProfile}
      />

      {/* Main Content Column: Smooth independent vertical scrolling */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Navbar: Sticky at top of the scrolling viewport */}
        <Navbar
          onToggleMobile={() => setIsMobileOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          killSwitchActive={killSwitchActive}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          rolesList={rolesList}
          adminProfile={adminProfile}
          setAdminProfile={setAdminProfile}
          onLogout={onLogout}
        />

        {/* Dynamic Module Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 text-center text-xs text-slate-500 shrink-0">
          <p>
            TradeNova Algorithmic Trading Platform &bull; SEBI-Compliant Admin RBAC &bull; CashPanel Aesthetic
          </p>
        </footer>
      </div>
    </div>
  );
}
