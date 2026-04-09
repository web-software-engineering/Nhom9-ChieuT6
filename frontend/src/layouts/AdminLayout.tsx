import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Home, Box, Folder, FileText,
  ChevronLeft, ChevronRight,
  BarChart, LogOut, Key, Moon, Sun, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Tạo interface cho admin
interface Admin {
  user_ID?: number;
  username?: string;
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const admin: Admin = JSON.parse(sessionStorage.getItem("adminUser") || "{}");

  // Click ngoài đóng menu
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleChangePassword = async () => {
    setError("");
    if (!oldPass || !newPass || !confirm) return setError("Nhập đầy đủ thông tin");
    if (newPass.length < 6) return setError("Mật khẩu >= 6 ký tự");
    if (newPass !== confirm) return setError("Xác nhận không khớp");

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ID: admin.user_ID, oldPassword: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Đổi mật khẩu thất bại");
      alert("Đổi mật khẩu thành công!");
      setOpenModal(false); setOldPass(""); setNewPass(""); setConfirm("");
      sessionStorage.setItem("adminUser", JSON.stringify({ ...admin }));
    } catch {
      setError("Lỗi server");
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { name: "Danh mục", icon: Folder, path: "/admin/categories" },
    { name: "Sản phẩm", icon: Box, path: "/admin/products" },
    { name: "Đơn hàng", icon: FileText, path: "/admin/orders" },
    { name: "Thống kê", icon: BarChart, path: "/admin/stats" },
  ];

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className={`flex min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
        {/* SIDEBAR */}
        <aside className={`flex flex-col ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} shadow-md ${collapsed ? "w-20" : "w-64"}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
            {!collapsed && <h2 className="text-blue-500 font-bold">Admin</h2>}
            <button onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {menuItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 mx-2 rounded-lg ${isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100 dark:hover:bg-gray-700"}`
                }
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col">
          <header className={`flex justify-between items-center px-6 py-3 shadow ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            <h1 className="font-semibold">Admin</h1>
            <div className="flex items-center gap-4">
              <button onClick={toggleDark}>{darkMode ? <Sun /> : <Moon />}</button>
              <div className="relative" ref={menuRef}>
                <div onClick={() => setOpenMenu(!openMenu)} className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold cursor-pointer">
                  {admin?.username?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <AnimatePresence>
                  {openMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border z-50"
                    >
                      <button onClick={() => { setOpenModal(true); setOpenMenu(false); }} className="w-full px-4 py-2 flex gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"><Key size={16} /> Đổi mật khẩu</button>
                      <button onClick={handleLogout} className="w-full px-4 py-2 flex gap-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-700"><LogOut size={16} /> Đăng xuất</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6"><div className="overflow-x-auto"><Outlet /></div></main>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {openModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenModal(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96"
              >
                <h2 className="text-lg font-bold mb-4">🔐 Đổi mật khẩu</h2>
                <input type="password" placeholder="Mật khẩu cũ" value={oldPass} onChange={(e) => setOldPass(e.target.value)} className="w-full border p-2 mb-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"/>
                <div className="relative">
                  <input type={show ? "text" : "password"} placeholder="Mật khẩu mới" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full border p-2 mb-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"/>
                  <span onClick={() => setShow(!show)} className="absolute right-2 top-2 cursor-pointer">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</span>
                </div>
                <input type="password" placeholder="Xác nhận mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border p-2 mb-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white"/>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setOpenModal(false)} className="px-3 py-1 bg-gray-300 rounded dark:bg-gray-600">Hủy</button>
                  <button onClick={handleChangePassword} className="px-3 py-1 bg-blue-500 text-white rounded">Lưu</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}