import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";

type User = {
  id: number;
  name: string;
};

const API_ROOT = (
  import.meta.env.VITE_USERS_API_BASE ??
  (import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, "")
    : "http://localhost:5000")
).replace(/\/+$/, "");
const API = `${API_ROOT}/users`;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsers(await res.json());
      setError(null);
    } catch {
      setError("Không thể tải danh sách người dùng. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers((prev) => [...prev, data]);
      setNewName("");
    } catch {
      setError("Không thể thêm người dùng.");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditName(u.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
      cancelEdit();
    } catch {
      setError("Không thể cập nhật người dùng.");
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Không thể xóa người dùng.");
    }
  };

  return (
    <div className="animate-fade-in space-y-5 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Người dùng</h1>
            <p className="text-sm text-slate-500">
              Quản lý danh sách tài khoản
            </p>
          </div>
        </div>
        {!loading && (
          <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 sm:self-auto">
            {users.length} người dùng
          </span>
        )}
      </div>

      {/* Add user panel */}
      <div className="glass-panel rounded-2xl px-4 py-4 sm:px-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Thêm người dùng mới
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUser()}
            placeholder="Nhập tên người dùng…"
            className="input-modern flex-1"
          />
          <button
            onClick={addUser}
            disabled={adding || !newName.trim()}
            className="primary-btn inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Thêm
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="flex-1 text-sm font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Đang tải…</span>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && (
        <>
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <article key={u.id} className="soft-card px-4 py-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {editingId === u.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(u.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="input-modern py-2 text-sm"
                      />
                    ) : (
                      <>
                        <p className="truncate text-base font-semibold text-slate-900">
                          {u.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          ID: {u.id}
                        </p>
                      </>
                    )}
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                    #{u.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {editingId === u.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(u.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-600"
                      >
                        <Check className="h-3.5 w-3.5" /> Lưu
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        <X className="h-3.5 w-3.5" /> Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(u)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Sửa
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Xóa
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}

            {users.length === 0 && (
              <div className="soft-card px-5 py-14 text-center text-slate-400">
                <UsersIcon className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p>Chưa có người dùng nào.</p>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="glass-panel hidden overflow-hidden rounded-2xl md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tên
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">
                      {u.id}
                    </td>
                    <td className="px-5 py-3">
                      {editingId === u.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(u.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="input-modern py-1.5 text-sm"
                        />
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {u.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === u.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(u.id)}
                              className="flex items-center gap-1 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-600"
                            >
                              <Check className="h-3.5 w-3.5" /> Lưu
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                              <X className="h-3.5 w-3.5" /> Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Sửa
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      <UsersIcon className="mx-auto mb-3 h-10 w-10 opacity-30" />
                      <p>Chưa có người dùng nào.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
