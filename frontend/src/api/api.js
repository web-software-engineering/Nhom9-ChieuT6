import axios from "axios";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:3000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
});

// 👉 Gắn accessToken vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 👉 Tự động refresh token khi hết hạn
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          token: refreshToken,
        });

        // lưu access token mới
        localStorage.setItem("accessToken", res.data.accessToken);

        // gọi lại request cũ
        err.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(err.config);
      } catch (error) {
        // refresh fail → logout
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  },
);

export default api;
