import React, { useState } from 'react';
import {
  Globe,
  Bell,
  Search,
  Menu,
  ChevronDown,
  ShieldAlert,
  Shield,
  LayoutGrid,
  CheckCircle2,
  User,
  LogOut,
  X,
  Camera,
  Save,
  MapPin,
  Building,
  KeyRound
} from 'lucide-react';

export default function Navbar({
  onToggleMobile,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  killSwitchActive,
  currentRole,
  setCurrentRole,
  rolesList,
  adminProfile,
  setAdminProfile,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(adminProfile?.name || 'Admin User');
  const [editEmail, setEditEmail] = useState(adminProfile?.email || 'admin@tradenova.io');
  const [editPhone, setEditPhone] = useState(adminProfile?.phone || '+91 98201 00000');
  const [editAddress, setEditAddress] = useState(adminProfile?.address || 'Plot C-59, G Block, BKC Financial Center');
  const [editCity, setEditCity] = useState(adminProfile?.city || 'Mumbai');
  const [editState, setEditState] = useState(adminProfile?.state || 'Maharashtra');
  const [editPincode, setEditPincode] = useState(adminProfile?.pincode || '400051');
  const [editCountry, setEditCountry] = useState(adminProfile?.country || 'India');
  const [editAvatar, setEditAvatar] = useState(
    adminProfile?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  );
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Preset avatar choices for quick edit
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setAdminProfile({
      ...adminProfile,
      name: editName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      city: editCity,
      state: editState,
      pincode: editPincode,
      country: editCountry,
      avatar: editAvatar
    });
    setProfileSuccessMsg('Profile and address updated successfully!');
    setTimeout(() => {
      setProfileSuccessMsg('');
      setShowEditProfileModal(false);
    }, 1200);
  };

  // Live market tickers matching screenshot 2
  const tickers = [
    { symbol: 'BTC', price: '117,013.60', change: '+8%', up: true },
    { symbol: 'ETH', price: '29,877.66', change: '+8%', up: true },
    { symbol: 'BNB', price: '19,270.56', change: '-8%', up: false },
    { symbol: 'NIFTY', price: '24,850.20', change: '+1.2%', up: true }
  ];

  return (
    <>
      <header className="sticky top-0 z-20 px-3 sm:px-6 pt-3 pb-2 bg-[#D8E4EE]/95 backdrop-blur-md border-b border-[#CFDEEB]/40">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section: Mobile Menu + Pill Navigation Bar */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onToggleMobile}
              className="p-2 sm:p-2.5 bg-white text-slate-700 hover:bg-slate-50 rounded-full lg:hidden shadow-xs border border-[#CFDEEB] shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* CashPanel Nav Pills bar matching screenshot 2 + dark pill button */}
            <div className="bg-white/90 backdrop-blur-md p-1 rounded-full border border-[#CFDEEB] flex items-center gap-1 shadow-xs shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-[#111827] text-white shadow-md font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs transition-all ${
                  activeTab === 'orders'
                    ? 'bg-[#111827] text-white shadow-md font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
                }`}
              >
                Analytic
              </button>
              <button
                onClick={() => setActiveTab('strategies')}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs transition-all hidden xs:inline-block ${
                  activeTab === 'strategies'
                    ? 'bg-[#111827] text-white shadow-md font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
                }`}
              >
                Trading
              </button>

              {/* Search Pill - auto shrinks on smaller screens */}
              <div className="hidden md:flex items-center gap-1.5 pl-2.5 pr-3 py-1 bg-[#EDF3F8] rounded-full text-xs font-semibold text-slate-700 ml-1 border border-[#D5E3EE] max-w-[180px] lg:max-w-[220px]">
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Market: BTC/USDT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none w-full truncate"
                />
              </div>
            </div>
          </div>

          {/* Right Section: Responsive Tickers, Role Selector & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Market Tickers strip - responsive display */}
            <div className="hidden 2xl:flex items-center gap-3">
              {tickers.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-semibold">{t.symbol}</span>
                  <span className="font-bold text-slate-800 font-mono text-[11px]">{t.price}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {t.change}
                  </span>
                </div>
              ))}
            </div>

            {/* Compact 1-ticker display on 1280px-1535px screens */}
            <div className="hidden xl:flex 2xl:hidden items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">BTC</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">117,013.60</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                +8%
              </span>
            </div>

            {/* Kill switch warning */}
            {killSwitchActive && (
              <span className="px-2.5 sm:px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] sm:text-[11px] font-bold animate-pulse flex items-center gap-1 shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">KILL SWITCH</span>
              </span>
            )}

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleSelector(!showRoleSelector);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="px-2.5 sm:px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-[#CFDEEB] rounded-full shadow-xs flex items-center gap-1.5 text-xs font-bold text-slate-800 transition-colors"
                title="Switch BRD Admin Role"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline max-w-[110px] truncate">
                  {currentRole?.name || 'Super Admin'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {/* Roles Dropdown Menu */}
              {showRoleSelector && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-[#CFDEEB] p-3 z-50 animate-in fade-in zoom-in-95 text-xs">
                  <div className="px-2 pb-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">Admin RBAC Roles (BRD Page 10)</p>
                    <p className="text-[10px] text-slate-400">Least privilege access model</p>
                  </div>
                  <div className="py-2 space-y-1">
                    {rolesList.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setCurrentRole(role);
                          setShowRoleSelector(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-start justify-between ${
                          currentRole?.id === role.id
                            ? 'bg-[#111827] text-white'
                            : 'hover:bg-[#EDF3F8] text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{role.name}</p>
                          <p
                            className={`text-[10px] leading-tight mt-0.5 ${
                              currentRole?.id === role.id ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {role.description}
                          </p>
                        </div>
                        {currentRole?.id === role.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full py-2 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Role-Wise Login Screen &rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification button */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleSelector(false);
                setShowProfileMenu(false);
              }}
              className="p-2 sm:p-2.5 bg-white hover:bg-slate-50 border border-[#CFDEEB] rounded-full shadow-xs text-slate-700 relative transition-colors shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="w-2 h-2 rounded-full bg-[#1E6BFB] absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowRoleSelector(false);
                }}
                className="p-0.5 bg-white hover:bg-slate-50 border border-[#CFDEEB] rounded-full shadow-xs flex items-center transition-colors shrink-0"
                aria-label="Admin Profile"
              >
                <img
                  src={adminProfile?.avatar}
                  alt={adminProfile?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              </button>

              {/* User Dropdown matching user's exact screenshot requirement: ONLY Profile Edit & Logout */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-[#CFDEEB] p-3 z-50 animate-in fade-in zoom-in-95 text-xs">
                  {/* Header info */}
                  <div className="px-2 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 text-sm truncate">{adminProfile?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{adminProfile?.email}</p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full text-[10px]">
                      Role: {currentRole?.name}
                    </span>
                  </div>

                  {/* Actions: Edit Profile, Role Login & Logout */}
                  <div className="pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowEditProfileModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-2xl hover:bg-[#EDF3F8] font-bold text-slate-700 flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-2xl hover:bg-amber-50 font-bold text-amber-800 flex items-center gap-2.5 transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>Role-Wise Login</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-2xl hover:bg-rose-50 font-bold text-rose-600 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications popup */}
        {showNotifications && (
          <div className="absolute right-4 sm:right-8 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-xl border border-[#CFDEEB] p-4 z-50 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">Notifications</p>
              <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark read</span>
            </div>
            <div className="py-2 space-y-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">Shoonya Token Refreshed</p>
                <p className="text-slate-400 text-[10px]">Adapter synced 2m ago</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">RSI Momentum Pro Triggered</p>
                <p className="text-slate-400 text-[10px]">Order BUY NIFTY 24500 CE executed</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-4xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#111827] text-white flex items-center justify-center shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Edit Admin Profile</h3>
                  <p className="text-[10px] text-slate-400">Update account credentials & address details</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shrink-0 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* Avatar Preview & Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Profile Avatar</label>
                <div className="flex items-center gap-3">
                  <img
                    src={editAvatar}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500 shadow-sm shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-medium mb-1.5">Choose avatar preset:</p>
                    <div className="flex items-center gap-2">
                      {avatarPresets.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(av)}
                          className={`w-8 h-8 rounded-full overflow-hidden ring-2 transition-all shrink-0 ${
                            editAvatar === av ? 'ring-blue-600 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Personal Information
                </p>

                {/* Full Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Email & Phone in 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Office & Physical Address Details */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Office & Address Details
                  </p>
                </div>

                {/* Street Address */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Street Address / Office Building</label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. Plot C-59, G Block, BKC Financial Center"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* City & State in 2 cols */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Pincode & Country in 2 cols */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">PIN / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value)}
                      placeholder="e.g. 400051"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="e.g. India"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Active Role Info */}
              <div className="p-3 bg-[#F0F5FA] rounded-2xl flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">System Role</span>
                  <p className="font-extrabold text-slate-900 text-xs">{currentRole?.name}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {currentRole?.badge}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#111827] hover:bg-black text-white text-xs font-bold rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
