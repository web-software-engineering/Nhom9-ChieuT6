// src/pages/admin/AdminLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Loader2 } from "lucide-react";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ GỌI API LOGIN (backend bcrypt)
      const res = await axios.post("http://localhost:3000/api/users/login-admin", {
        username,
        password,
      });

      const admin = res.data;

      // ✅ lưu session
      sessionStorage.setItem("adminUser", JSON.stringify(admin));

      // ✅ chuyển trang
      navigate("/admin/dashboard");

    } catch (err: any) {
      console.error(err);

      // ✅ hiển thị lỗi từ backend
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Office Smart
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Đăng nhập để quản lý hệ thống
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tên đăng nhập
            </label>
            <div className="flex items-center border rounded-lg mt-1 px-3 focus-within:ring-2 focus-within:ring-blue-400">
              <User className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-2 py-2 outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="flex items-center border rounded-lg mt-1 px-3 focus-within:ring-2 focus-within:ring-blue-400">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2 py-2 outline-none"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-2 rounded">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Office Smart Admin
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;