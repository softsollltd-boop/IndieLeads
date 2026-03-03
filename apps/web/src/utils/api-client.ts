import axios from 'axios';

/**
 * IndieLeads API Client
 * Logic hardened for production with unified response handling.
 */
const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    envUrl = envUrl.replace(/\/$/, '');
    const apiPrefixIdx = envUrl.indexOf('/api/v1');
    if (apiPrefixIdx !== -1) {
      envUrl = envUrl.substring(0, apiPrefixIdx + 7);
    } else {
      envUrl = `${envUrl}/api/v1`;
    }
    return envUrl;
  }

  if (typeof window === 'undefined') return 'http://localhost:3000/api/v1';

  const host = window.location.hostname;
  return `${window.location.protocol}//${host}:3000/api/v1`;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 25000, // 25s — leaves room for SMTP+IMAP check (2x10s) plus network
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Auth & Context Injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const workspaceId = localStorage.getItem('workspaceId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (workspaceId) config.headers['x-workspace-id'] = workspaceId;
  return config;
});

// Response Interceptor: Standardization & Auth Guard
apiClient.interceptors.response.use(
  (response) => {
    // Automatically unwrap the 'data' field from the world-class API envelope
    if (response.data && response.data.data !== undefined) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    // Session Expiry Handling
    if (error.response?.status === 401) {
      const isLoginOrSignup = window.location.hash.includes('login') || window.location.hash.includes('signup');
      if (!isLoginOrSignup) {
        localStorage.clear();
        window.location.href = '#/login';
      }
    }

    // Structured Error Extraction
    const responseData = error.response?.data;
    const errorMessage = responseData?.error?.message || error.message;

    // Log error for developers
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}: ${errorMessage}`);

    return Promise.reject(error);
  }
);

export default apiClient;
