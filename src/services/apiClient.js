/**
 * Central API Client for Tradenova Admin Panel
 * Connects to Backend API (Local or Render via .env)
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Generic API Request Wrapper
 */
const request = async (endpoint, options = {}) => {
  let token = localStorage.getItem('tradenova_admin_token');

  // Auto-login default admin if token is missing
  if (!token && !endpoint.includes('/auth/login') && !endpoint.includes('/market/')) {
    try {
      const authRes = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@platform.com', password: 'AdminPassword@123' }),
      });
      const authData = await authRes.json();
      if (authData.data?.tokens?.accessToken) {
        token = authData.data.tokens.accessToken;
        localStorage.setItem('tradenova_admin_token', token);
        localStorage.setItem('tradenova_admin_user', JSON.stringify(authData.data.admin));
      }
    } catch (e) {
      console.warn('[apiClient] Auto-auth attempt failed:', e.message);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------
export const adminLogin = async (email, password) => {
  const res = await request('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (res.data?.tokens?.accessToken) {
    localStorage.setItem('tradenova_admin_token', res.data.tokens.accessToken);
    localStorage.setItem('tradenova_admin_user', JSON.stringify(res.data.admin));
  }

  return res.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem('tradenova_admin_token');
  localStorage.removeItem('tradenova_admin_user');
};

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
export const getDashboardStats = async () => {
  return await request('/admin/dashboard');
};

// -------------------------------------------------------------
// USER MANAGEMENT
// -------------------------------------------------------------
export const getAdminUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await request(`/admin/users?${query}`);
};

export const getUserDetails = async (userId) => {
  return await request(`/admin/users/${userId}`);
};

export const updateUserStatus = async (userId, status, reason = '') => {
  return await request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
};

// -------------------------------------------------------------
// STRATEGY & DEPLOYMENT MANAGEMENT
// -------------------------------------------------------------
export const getAdminStrategies = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await request(`/admin/strategies?${query}`);
};

export const updateStrategyStatus = async (strategyId, status) => {
  return await request(`/admin/strategies/${strategyId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const getAdminDeployments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await request(`/admin/deployments?${query}`);
};

export const triggerEmergencyKillSwitch = async (reason = 'Manual Admin Trigger') => {
  return await request('/admin/kill-switch', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// -------------------------------------------------------------
// ORDERS & AUDIT
// -------------------------------------------------------------
export const getAdminOrders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await request(`/admin/orders?${query}`);
};

export const getAdminAuditLogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await request(`/admin/audit-logs?${query}`);
};

// -------------------------------------------------------------
// LIVE MARKET DATA & CANDLESTICKS
// -------------------------------------------------------------
export const getLiveIndices = async () => {
  return await request('/market/indices');
};

export const getLiveCandles = async (symbol = 'NIFTY', interval = '15m', days = 3) => {
  return await request(`/market/candles?symbol=${symbol}&interval=${interval}&days=${days}`);
};
