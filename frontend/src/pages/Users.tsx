import { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
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

const API = "http://localhost:3000/api/users";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // GET USERS
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();

      const data = await res.json();

      const mapped: User[] = data.map((u: any) => ({
        id: u.user_ID,
        username: u.username,
        name: u.name,
        email: u.email,
        role: u.role,
      }));

      setUsers(mapped);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ADD (demo chỉ name)
  const addUser = async () => {
    if (!newName.trim()) return;
    setAdding(true);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();

      setUsers((prev) => [
        ...prev,
        {
          id: data.user_ID,
          username: data.username,
          name: data.name,
          email: data.email,
          role: data.role,
        },
      ]);

      setNewName("");
    } catch {
      setError("Không thể thêm user");
    } finally {
      setAdding(false);
    }
  };

  // DELETE
  const deleteUser = async (id: number) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // EDIT
  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditName(u.name);
  };

  const saveEdit = async (id: number) => {
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, name: editName } : u))
    );

    setEditingId(null);
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <UsersIcon />
        <h1 className="text-xl font-bold">Users</h1>
      </div>

      {/* ADD */}
      <div className="flex gap-2">
        <input
          className="border p-2"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên user"
        />
        <button onClick={addUser} className="bg-blue-500 text-white px-3">
          {adding ? "..." : "Thêm"}
        </button>
      </div>

      {error && (
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>ID</th>
              <th>Username</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td>{u.id}</td>
                <td>{u.username}</td>

                <td>
                  {editingId === u.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    u.name
                  )}
                </td>

                <td>{u.email}</td>
                <td>
                  <span
                    className={
                      u.role === "admin"
                        ? "text-red-500"
                        : u.role === "seller"
                        ? "text-blue-500"
                        : "text-green-500"
                    }
                  >
                    {u.role}
                  </span>
                </td>

                <td className="flex gap-2">
                  {editingId === u.id ? (
                    <button onClick={() => saveEdit(u.id)}>
                      <Check />
                    </button>
                  ) : (
                    <button onClick={() => startEdit(u)}>
                      <Pencil />
                    </button>
                  )}

                  <button onClick={() => deleteUser(u.id)}>
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}