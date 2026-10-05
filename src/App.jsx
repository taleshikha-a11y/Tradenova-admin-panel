import React, { useState } from 'react';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './components/modules/Dashboard/Dashboard';
import Users from './components/modules/Users/Users';
import Strategies from './components/modules/Strategies/Strategies';
import Brokers from './components/modules/Brokers/Brokers';
import Orders from './components/modules/Orders/Orders';
import Payments from './components/modules/Payments/Payments';
import Incidents from './components/modules/Incidents/Incidents';
import AuditLogs from './components/modules/AuditLogs/AuditLogs';
import SystemSettings from './components/modules/SystemSettings/SystemSettings';
import Login from './components/modules/Auth/Login';
import AccessDenied from './components/common/AccessDenied';
import { authorizeModuleAccess } from './services/adminRbacService';
import rolesData from './data/rolesData.json';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // Admin Profile State (Editable from Profile Dropdown)
  // Default to Super Admin credentials (no generic 'Admin User')
  const [adminProfile, setAdminProfile] = useState({
    name: 'Vikramaditya Singhania',
    email: 'superadmin@tradenova.io',
    phone: '+91 98201 00000',
    address: 'Plot C-59, G Block, BKC Financial Center',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    country: 'India',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  });

  // RBAC Admin Roles from BRD Page 10:
  // Super Admin, Operations, Compliance/Review, Support, Finance, Read Only
  const [rolesList, setRolesList] = useState(() => {
    try {
      const saved = localStorage.getItem('tradenova_roles_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return rolesData.roles;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('tradenova_current_role');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return rolesData.roles[0]; // Default: Super Admin
  });

  const handleSetCurrentRole = (role) => {
    setCurrentRole(role);
    try {
      localStorage.setItem('tradenova_current_role', JSON.stringify(role));
    } catch (e) {}
  };

  const handleLogin = (selectedRole, profileData) => {
    if (selectedRole) {
      handleSetCurrentRole(selectedRole);
    }
    if (profileData) {
      setAdminProfile(profileData);
    }
    setIsAuthenticated(true);
  };

  const handleUpdateRolePermissions = (roleId, newPermissions) => {
    setRolesList((prev) => {
      const updated = prev.map((r) => {
        if (r.id === roleId) {
          const updatedRole = { ...r, permissions: newPermissions };
          if (currentRole.id === roleId) {
            handleSetCurrentRole(updatedRole);
          }
          return updatedRole;
        }
        return r;
      });
      try {
        localStorage.setItem('tradenova_roles_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetRolePermissions = () => {
    setRolesList(rolesData.roles);
    try {
      localStorage.removeItem('tradenova_roles_list');
    } catch (e) {}
    const matched = rolesData.roles.find((r) => r.id === currentRole.id) || rolesData.roles[0];
    handleSetCurrentRole(matched);
  };

  // If user clicked Logout, show the Login / Auth Screen
  if (!isAuthenticated) {
    return (
      <Login
        rolesList={rolesList}
        adminProfile={adminProfile}
        onLogin={handleLogin}
      />
    );
  }

  // Render the appropriate module component based on activeTab
  const renderModule = () => {
    // Server-Side Route Guard (BRD §13 & §14 least-privilege enforcement)
    const accessCheck = authorizeModuleAccess(currentRole, activeTab);
    if (!accessCheck.allowed) {
      return (
        <AccessDenied
          moduleName={accessCheck.moduleName}
          currentRole={currentRole}
          authorizedRoles={accessCheck.authorizedRoles}
          onReturnDashboard={() => setActiveTab('overview')}
          onSwitchRole={() => setIsAuthenticated(false)}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return <Dashboard setActiveTab={setActiveTab} currentRole={currentRole} />;
      case 'users':
        return <Users globalSearch={searchQuery} currentRole={currentRole} />;
      case 'strategies':
        return <Strategies globalSearch={searchQuery} currentRole={currentRole} />;
      case 'brokers':
        return <Brokers currentRole={currentRole} />;
      case 'orders':
        return <Orders globalSearch={searchQuery} currentRole={currentRole} />;
      case 'payments':
        return <Payments globalSearch={searchQuery} currentRole={currentRole} />;
      case 'incidents':
        return <Incidents currentRole={currentRole} />;
      case 'audit-logs':
        return <AuditLogs globalSearch={searchQuery} currentRole={currentRole} />;
      case 'settings':
        return (
          <SystemSettings
            killSwitchActive={killSwitchActive}
            setKillSwitchActive={setKillSwitchActive}
            currentRole={currentRole}
            setCurrentRole={handleSetCurrentRole}
            rolesList={rolesList}
            onUpdateRolePermissions={handleUpdateRolePermissions}
            onResetRolePermissions={handleResetRolePermissions}
            onLogout={() => setIsAuthenticated(false)}
          />
        );
      default:
        return <Dashboard setActiveTab={setActiveTab} currentRole={currentRole} />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      killSwitchActive={killSwitchActive}
      currentRole={currentRole}
      setCurrentRole={handleSetCurrentRole}
      rolesList={rolesList}
      adminProfile={adminProfile}
      setAdminProfile={setAdminProfile}
      onLogout={() => setIsAuthenticated(false)}
    >
      {renderModule()}
    </AdminLayout>
  );
}
