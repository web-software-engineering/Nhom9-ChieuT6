import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, UserCircle2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const PROFILE_UPDATED_EVENT = "auth-profile-updated";
const DISPLAY_NAME_KEY = "authDisplayName";
const AUTH_PROFILE_KEY = "authUserProfile";

function readLocalProfile() {
  const token = localStorage.getItem("accessToken");
  let decoded = {};

  if (token) {
    try {
      decoded = jwtDecode(token);
    } catch {
      decoded = {};
    }
  }

  let cached = {};
  try {
    cached = JSON.parse(localStorage.getItem(AUTH_PROFILE_KEY) || "{}");
  } catch {
    cached = {};
  }

  return {
    username: cached.username || decoded.username || "",
    name: cached.name || decoded.name || decoded.username || "",
    contact_add: cached.contact_add || "",
    address: cached.address || "",
    email: cached.email || decoded.email || "",
    role: cached.role || decoded.role || "user",
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    username: "",
    name: "",
    contact_add: "",
    address: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    setLoading(true);
    setError("");
    setForm(readLocalProfile());
    setLoading(false);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.username.trim() || !form.name.trim() || !form.email.trim()) {
      setError("Vui lòng nhập đầy đủ username, họ tên và email.");
      setSaving(false);
      return;
    }

    const normalizedProfile = {
      ...form,
      username: form.username.trim(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      contact_add: form.contact_add.trim(),
      address: form.address.trim(),
    };

    localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(normalizedProfile));
    localStorage.setItem(DISPLAY_NAME_KEY, normalizedProfile.name);
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));

    setForm(normalizedProfile);
    setSuccess("Đã cập nhật hồ sơ trên local thành công.");
    setSaving(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="soft-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sửa hồ sơ</h1>
              <p className="text-sm text-slate-500">
                Cập nhật thông tin tài khoản của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="secondary-btn inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải hồ sơ...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <label className="text-sm font-semibold text-slate-700">
              Username
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="input-modern mt-2"
                required
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Họ tên
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-modern mt-2"
                required
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Liên hệ
              <input
                name="contact_add"
                value={form.contact_add}
                onChange={handleChange}
                className="input-modern mt-2"
                placeholder="Số điện thoại hoặc thông tin liên hệ"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Địa chỉ
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="input-modern mt-2"
                placeholder="Địa chỉ hiện tại"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-modern mt-2"
                required
              />
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 sm:col-span-2">
                {success}
              </p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="primary-btn inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
