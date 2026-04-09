import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        d="M21.35 11.1H12v2.95h5.35c-.23 1.4-1.6 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.25 12 6.25c1.84 0 3.07.79 3.78 1.47l2.58-2.48C16.69 3.7 14.54 2.75 12 2.75c-5.19 0-9.4 4.21-9.4 9.4s4.21 9.4 9.4 9.4c5.41 0 8.99-3.8 8.99-9.16 0-.62-.07-1.09-.14-1.29Z"
        fill="#4285F4"
      />
      <path
        d="M3.76 8.99 6.85 11.2c.83-2.61 3.23-4.95 5.15-4.95 1.84 0 3.07.79 3.78 1.47l2.58-2.48C16.69 3.7 14.54 2.75 12 2.75c-3.74 0-6.96 2.15-8.24 5.24Z"
        fill="#EA4335"
      />
      <path
        d="M12 21.15c2.6 0 4.78-.86 6.37-2.34l-2.95-2.42c-.8.55-1.88.95-3.42.95-2.62 0-4.85-1.76-5.64-4.19L3.17 15.4C4.45 18.56 7.81 21.15 12 21.15Z"
        fill="#34A853"
      />
      <path
        d="M21.35 11.1H12v2.95h5.35c-.35 2.14-1.9 3.55-3.93 4.16l2.95 2.42c1.71-1.57 2.98-4.03 2.98-6.86 0-.62-.07-1.09-.14-1.29Z"
        fill="#FBBC05"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        d="M12 2.5C6.75 2.5 2.5 6.64 2.5 11.75c0 4.62 3.55 8.43 8.13 9.12V14.3H8.1v-2.55h2.53v-1.94c0-2.48 1.52-3.84 3.75-3.84 1.07 0 1.99.08 2.26.12v2.62h-1.55c-1.22 0-1.46.57-1.46 1.42v1.62h2.93l-.38 2.55h-2.55v6.57c4.58-.69 8.12-4.5 8.12-9.12C21.5 6.64 17.25 2.5 12 2.5Z"
        fill="#1877F2"
      />
      <path
        d="M14.98 14.3h2.55l.38-2.55h-2.93v-1.62c0-.85.24-1.42 1.46-1.42h1.55V6.09c-.27-.04-1.19-.12-2.26-.12-2.23 0-3.75 1.36-3.75 3.84v1.94H8.1v2.55h2.53v6.57c.47.07.95.12 1.37.12.97 0 1.89-.12 2.98-.42V14.3Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [contactAdd, setContactAdd] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const authBaseUrl =
    import.meta.env.VITE_API_BASE ?? "http://localhost:3000/api";

  const handleRegister = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    if (!username.trim() || !name.trim() || !email.trim()) {
      alert("Vui lòng nhập username, tên và email");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        username,
        name,
        contact_add: contactAdd,
        address,
        email,
        password,
        role,
      });
      alert("Đăng ký thành công");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = (provider) => {
    window.location.href = `${authBaseUrl}/auth/${provider}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <form
        onSubmit={handleRegister}
        className="soft-card animate-float-up w-full max-w-2xl p-6 sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Office Smart
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">Đăng ký</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Tạo tài khoản mới với đầy đủ thông tin người dùng.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Username
            <input
              className="input-modern mt-2"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="ten_dang_nhap"
              autoComplete="username"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Tên
            <input
              className="input-modern mt-2"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Liên hệ
            <input
              className="input-modern mt-2"
              type="text"
              value={contactAdd}
              onChange={(event) => setContactAdd(event.target.value)}
              placeholder="0123456789"
              autoComplete="tel"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Địa chỉ
            <input
              className="input-modern mt-2"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="TP. Hồ Chí Minh"
              autoComplete="street-address"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              className="input-modern mt-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Vai trò
            <select
              className="input-modern mt-2"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="customer">customer</option>
              <option value="seller">seller</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              className="input-modern mt-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Nhập lại password
            <input
              className="input-modern mt-2"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <button
          className="primary-btn mt-6 w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Hoặc
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleOAuthSignup("google")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <GoogleIcon />
            <span>Đăng ký Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignup("facebook")}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FacebookIcon />
            <span>Đăng ký Facebook</span>
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-teal-700 transition hover:text-teal-800"
          >
            Đăng nhập ngay
          </button>
        </p>
      </form>
    </div>
  );
}
