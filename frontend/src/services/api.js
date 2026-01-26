// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("rf_auth_v1");
    console.log('🔐 Auth raw data:', raw);
    if (raw) {
      const parsed = JSON.parse(raw);
      console.log('🔐 Parsed auth data:', parsed);
      const accessToken = parsed?.accessToken ?? parsed?.token ?? null; 
      console.log('🔐 Access token:', accessToken ? `Present (${accessToken.substring(0, 10)}...)` : 'Missing');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('🔐 Authorization header set successfully');
      } else {
        console.warn('🔐 No token found - request will be sent without authentication');
      }
    } else {
      console.warn('🔐 No auth data in localStorage');
    }
  } catch (error) {
    console.error('🔐 Auth error:', error);
  }
  console.log('📡 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});
api.interceptors.response.use(
  (res) => {
    console.log('✅ API Response:', res.status, res.config.method?.toUpperCase(), res.config.url);
    return res;
  },
  async (err) => {
    console.error('❌ API Error Response:', err.response?.status, err.config?.method?.toUpperCase(), err.config?.url);
    console.error('❌ Error details:', err.response?.data);
    
    const status = err.response?.status;
    const url = err.config?.url || "";
    if (status === 401) {
    
      if (/\/auth\/(login|refresh)/.test(url)) {
        return Promise.reject(err);
      }
      try {
        const raw = localStorage.getItem("rf_auth_v1");
        const parsed = raw ? JSON.parse(raw) : null;
        const rToken = parsed?.refreshToken;
        if (rToken) {
          const r = await api.post("/auth/refresh", { refreshToken: rToken });
          const next = {
            user: parsed?.user ?? r.data.user ?? null,
            accessToken: r.data.accessToken,
            refreshToken: r.data.refreshToken ?? rToken,
          };
          localStorage.setItem("rf_auth_v1", JSON.stringify(next));
        
          err.config.headers.Authorization = `Bearer ${next.accessToken}`;
          err.config._retry = true;
          return api(err.config);
        }
      } catch (e) {
     
      }

      localStorage.removeItem("rf_auth_v1");
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// API
export const authAPI = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  refresh: (payload) => api.post("/auth/refresh", payload),
  me: () => api.get("/users/me")
};

export const memberAPI = {
  list: () => api.get("/members"),
  stats: () => api.get("/members/stats"),
  create: (data) => api.post("/members", data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getById: (id) => api.get(`/members/${id}`)
};

export const auth = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default api;
