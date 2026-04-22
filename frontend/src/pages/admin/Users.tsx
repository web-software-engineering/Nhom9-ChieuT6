import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Users as UsersIcon,
  X,
  Check,
} from "lucide-react";

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
};

const API = import.meta.env.VITE_API_URL + "/api/users";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editData, setEditData] = useState({
    username: "",
    name: "",
    email: "",
  });

  const [showPassModal, setShowPassModal] = useState<number | null>(null);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  // ================= GET =================
  const fetchUsers = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("API lỗi");

      const data = await res.json();

      const mapped = data.map((u: any) => ({
        id: u.user_ID,
        username: u.username,
        name: u.name,
        email: u.email,
        role: u.role,
      }));

      setUsers(mapped);
    } catch (err) {
      console.error(err);
      alert("❌ Không load được users!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= EDIT =================
  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditData({
      username: u.username,
      name: u.name,
      email: u.email || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error();

      await fetchUsers();
      cancelEdit();
    } catch {
      alert("❌ Sửa thất bại!");
    }
  };

  // ================= DELETE =================
  const deleteUser = async (id: number) => {
    if (!confirm("Xóa user này?")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("❌ Xóa thất bại!");
    }
  };

  // ================= PASSWORD =================
  const changePassword = async () => {
    if (!oldPass || !newPass) {
      return alert("Nhập đầy đủ mật khẩu!");
    }

    if (!showPassModal) {
      return alert("Không xác định user!");
    }

    if (!confirm("Xác nhận đổi mật khẩu?")) return;

    try {
      const res = await fetch(`${API}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_ID: showPassModal,
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("✅ Đổi mật khẩu thành công");

      setShowPassModal(null);
      setOldPass("");
      setNewPass("");
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  useEffect(() => {
    if (showPassModal) {
      setOldPass("");
      setNewPass("");
    }
  }, [showPassModal]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <UsersIcon /> Quản Lý Users
      </h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto border rounded shadow">
          <table className="min-w-full bg-white text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">Tên</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Password</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-2">{u.id}</td>

                  <td className="border">
                    {editingId === u.id ? (
                      <input
                        value={editData.username}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            username: e.target.value,
                          })
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      u.username
                    )}
                  </td>

                  <td className="border">
                    {editingId === u.id ? (
                      <input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            name: e.target.value,
                          })
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      u.name
                    )}
                  </td>

                  <td className="border">
                    {editingId === u.id ? (
                      <input
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            email: e.target.value,
                          })
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      u.email
                    )}
                  </td>

                  <td
                    className={`border font-semibold ${
                      u.role === "admin"
                        ? "text-red-600"
                        : u.role === "seller"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {u.role}
                  </td>

                  <td className="border">******</td>

                  <td className="border py-2">
                    <div className="flex justify-center gap-2">
                      {editingId === u.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(u.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            <Check size={16} />
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 text-white px-2 py-1 rounded"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(u)}
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => setShowPassModal(u.id)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                          >
                            Đổi MK
                          </button>

                          <button
                            onClick={() => deleteUser(u.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Đổi mật khẩu</h2>

            <input
              type="password"
              placeholder="Mật khẩu cũ"
              className="border w-full mb-2 px-3 py-2 rounded"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />

            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="border w-full mb-4 px-3 py-2 rounded"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPassModal(null)}
                className="border px-4 py-2 rounded"
              >
                Hủy
              </button>

              <button
                onClick={changePassword}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}