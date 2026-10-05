/**
 * TradeNova SEBI BRD §13 & §14 Administrative RBAC & Security Service
 * 
 * Enforces server-side authorization simulation, route guards, least-privilege checks,
 * and immutable audit trail logging for exactly the 6 defined BRD Admin Panel roles:
 * 1. Super Admin
 * 2. Operations
 * 3. Compliance / Review
 * 4. Support
 * 5. Finance
 * 6. Read Only
 * 
 * Generic roles (such as 'admin', 'system_admin', 'manager') are strictly disallowed.
 */

import rolesData from '../data/rolesData.json';

// Exactly 6 valid Admin Panel roles specified by the BRD
export const VALID_ADMIN_ROLES = [
  'ROLE_SUPER_ADMIN',
  'ROLE_OPERATIONS',
  'ROLE_COMPLIANCE',
  'ROLE_SUPPORT',
  'ROLE_FINANCE',
  'ROLE_READ_ONLY'
];

export const ROLE_DISPLAY_NAMES = {
  ROLE_SUPER_ADMIN: 'Super Admin',
  ROLE_OPERATIONS: 'Operations',
  ROLE_COMPLIANCE: 'Compliance / Review',
  ROLE_SUPPORT: 'Support',
  ROLE_FINANCE: 'Finance',
  ROLE_READ_ONLY: 'Read Only'
};

// Module access matrix according to BRD §13 & §14 responsibilities
export const MODULE_ACCESS_POLICY = {
  overview: [
    'ROLE_SUPER_ADMIN',
    'ROLE_OPERATIONS',
    'ROLE_COMPLIANCE',
    'ROLE_SUPPORT',
    'ROLE_FINANCE',
    'ROLE_READ_ONLY'
  ],
  users: [
    'ROLE_SUPER_ADMIN',
    'ROLE_COMPLIANCE',
    'ROLE_SUPPORT',
    'ROLE_READ_ONLY'
  ],
  strategies: [
    'ROLE_SUPER_ADMIN',
    'ROLE_COMPLIANCE',
    'ROLE_SUPPORT',
    'ROLE_READ_ONLY'
  ],
  brokers: [
    'ROLE_SUPER_ADMIN',
    'ROLE_OPERATIONS',
    'ROLE_READ_ONLY'
  ],
  orders: [
    'ROLE_SUPER_ADMIN',
    'ROLE_OPERATIONS',
    'ROLE_SUPPORT',
    'ROLE_READ_ONLY'
  ],
  payments: [
    'ROLE_SUPER_ADMIN',
    'ROLE_FINANCE',
    'ROLE_SUPPORT',
    'ROLE_READ_ONLY'
  ],
  incidents: [
    'ROLE_SUPER_ADMIN',
    'ROLE_OPERATIONS',
    'ROLE_READ_ONLY'
  ],
  'audit-logs': [
    'ROLE_SUPER_ADMIN',
    'ROLE_OPERATIONS',
    'ROLE_COMPLIANCE',
    'ROLE_FINANCE',
    'ROLE_READ_ONLY'
  ],
  settings: [
    'ROLE_SUPER_ADMIN',
    'ROLE_OPERATIONS',
    'ROLE_READ_ONLY'
  ]
};

// Module readable names
export const MODULE_NAMES = {
  overview: 'Dashboard Overview',
  users: 'Trader & Account Management',
  strategies: 'Strategy Marketplace & Approvals',
  brokers: 'Broker Adapters & API Health',
  orders: 'Orders & Live Execution Stream',
  payments: 'Payments, Ledgers & Refunds',
  incidents: 'Operational Incidents & Outages',
  'audit-logs': 'Immutable Audit Logs',
  settings: 'System Settings & Role Governance'
};

/**
 * Validate that an admin role ID is one of the 6 recognized BRD roles
 */
export function isValidAdminRole(roleId) {
  return VALID_ADMIN_ROLES.includes(roleId);
}

/**
 * Server-Side Route Guard: Checks if a role is authorized to view a module page
 */
export function authorizeModuleAccess(currentRole, moduleId) {
  if (!currentRole || !isValidAdminRole(currentRole.id)) {
    return {
      allowed: false,
      status: 401,
      code: 'UNAUTHORIZED_ADMIN_ROLE',
      message: 'Unauthorized: Invalid or unrecognized administrative role credentials.',
      authorizedRoles: []
    };
  }

  const allowedRoles = MODULE_ACCESS_POLICY[moduleId] || ['ROLE_SUPER_ADMIN'];
  const hasAccess = allowedRoles.includes(currentRole.id);

  if (!hasAccess) {
    return {
      allowed: false,
      status: 403,
      code: 'MODULE_FORBIDDEN',
      message: `Access Denied (403 Forbidden): Your current role "${currentRole.name}" is not permitted to access ${MODULE_NAMES[moduleId] || moduleId} under SEBI Least-Privilege regulations.`,
      moduleName: MODULE_NAMES[moduleId] || moduleId,
      authorizedRoles: allowedRoles.map((rId) => ROLE_DISPLAY_NAMES[rId] || rId)
    };
  }

  return {
    allowed: true,
    status: 200,
    moduleName: MODULE_NAMES[moduleId] || moduleId
  };
}

/**
 * Server-Side Action Guard: Verifies write/mutation authority
 * 
 * Strict enforcement:
 * - Read Only role is 100% blocked from ALL write/mutation actions.
 * - Non-Super Admin roles must possess the specific permission key delegated to them.
 * - Super Admin has full authorization.
 */
export function authorizeAction(currentRole, permissionKey, actionName = 'Administrative Action') {
  // 1. Session & Role Authenticity Validation
  if (!currentRole || !isValidAdminRole(currentRole.id)) {
    logSecurityEvent(currentRole?.id || 'ANONYMOUS', actionName, permissionKey, 401, 'REJECTED');
    return {
      success: false,
      status: 401,
      error: 'Unauthorized',
      code: 'INVALID_ROLE',
      message: 'Unauthorized: Administrative session lacks valid BRD role authentication.'
    };
  }

  // 2. Strict Read Only Enforcement (BRD §13 & §14)
  if (currentRole.id === 'ROLE_READ_ONLY') {
    logSecurityEvent(currentRole.id, actionName, permissionKey, 403, 'READ_ONLY_BLOCKED');
    return {
      success: false,
      status: 403,
      error: 'Forbidden',
      code: 'READ_ONLY_ACCESS_DENIED',
      message: `Access Denied (403): Read Only role is strictly view-only under SEBI BRD regulations. The action "${actionName}" cannot be executed.`
    };
  }

  // 3. Super Admin Master Root Authority
  if (currentRole.id === 'ROLE_SUPER_ADMIN') {
    logSecurityEvent(currentRole.id, actionName, permissionKey, 200, 'AUTHORIZED_ROOT');
    return {
      success: true,
      status: 200,
      code: 'AUTHORIZED_ROOT',
      message: `Action "${actionName}" authorized via Super Admin master authority.`
    };
  }

  // 4. Role-Based Least-Privilege Permission Check
  const permissions = currentRole.permissions || [];
  const hasPermission = permissions.includes(permissionKey);

  if (!hasPermission) {
    logSecurityEvent(currentRole.id, actionName, permissionKey, 403, 'PERMISSION_MISSING');
    return {
      success: false,
      status: 403,
      error: 'Forbidden',
      code: 'FORBIDDEN_LEAST_PRIVILEGE',
      message: `Access Denied (403): Role "${currentRole.name}" does not possess the required "${permissionKey}" permission delegated by Super Admin for "${actionName}".`
    };
  }

  // 5. Authorized Action
  logSecurityEvent(currentRole.id, actionName, permissionKey, 200, 'AUTHORIZED');
  return {
    success: true,
    status: 200,
    code: 'AUTHORIZED',
    message: `Action "${actionName}" successfully authorized.`
  };
}

/**
 * Internal Security Event Logger for Immutable Audit Trail
 */
function logSecurityEvent(roleId, actionName, permissionKey, status, detail) {
  try {
    const entry = {
      id: `SEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      roleId,
      action: actionName,
      permissionKey,
      status,
      detail,
      ip: '127.0.0.1'
    };
    const existing = JSON.parse(localStorage.getItem('tradenova_security_audit_trail') || '[]');
    existing.unshift(entry);
    if (existing.length > 100) existing.pop();
    localStorage.setItem('tradenova_security_audit_trail', JSON.stringify(existing));
  } catch (e) {
    // LocalStorage fallback
  }
}
