import axios from 'axios';

/**
 * IndieLeads API Client
 * Hardened for PaaS cold-start environments (Render free tier).
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

const BASE_URL = getBaseURL();

const apiClient = axios.create({
  baseURL: BASE_URL,
  // 65s timeout — enough to survive a Render free-tier cold start (~40-60s)
  timeout: 65000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Silently wake up the Render server before the user interacts.
 * Call this once when the app loads. The server responds within ~60s after
 * being spun down. By pinging on app load we ensure it's warm by the time
 * the user clicks anything.
 */
export const wakeUpServer = async () => {
  try {
    const baseWithoutV1 = BASE_URL.replace('/api/v1', '');
    await axios.get(`${baseWithoutV1}/`, { timeout: 65000 });
    console.log('[API] Server is awake and ready.');
  } catch {
    console.log('[API] Warming up server...');
  }
};

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

    // Structured Error Extraction — surface exact backend message
    const responseData = error.response?.data;
    const errorMessage = responseData?.message || responseData?.error?.message || error.message;

    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}: ${errorMessage}`);

    return Promise.reject(error);
  }
);

export default apiClient;
