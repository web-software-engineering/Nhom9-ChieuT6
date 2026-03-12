import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, UserPlus } from "lucide-react";

function CreateUser() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://nhom9-chieut6-backend.onrender.com/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
      }

      navigate("/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-6 px-4 py-8">
      {/* Back link */}
      <Link
        to="/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>

      {/* Card */}
      <div className="glass-panel rounded-2xl px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Thêm người dùng</h1>
            <p className="text-sm text-slate-500">Nhập thông tin để tạo tài khoản mới</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-slate-700">
              Tên người dùng
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="input-modern"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="primary-btn flex flex-1 items-center justify-center gap-2">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo…</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Tạo người dùng</>
              )}
            </button>
            <Link to="/users" className="secondary-btn flex items-center justify-center px-5">
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;
