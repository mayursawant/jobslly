/**
 * Shared API configuration
 * All components should import from here instead of defining BACKEND_URL locally
 */

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
export const API_BASE = `${BACKEND_URL}/api`;

// Common API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE}/auth/login`,
        REGISTER: `${API_BASE}/auth/register`,
        ME: `${API_BASE}/auth/me`,
    },
    JOBS: `${API_BASE}/jobs`,
    BLOG: `${API_BASE}/blog`,
    CONTACT: `${API_BASE}/contact-us`,
    ADMIN: `${API_BASE}/admin`,
};
