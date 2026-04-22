import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import UserMenu from "../components/UserMenu";

const adminMenuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
  { name: "Danh mục", path: "/admin/categories", icon: "📁" },
  { name: "Sản phẩm", path: "/admin/products", icon: "📦" },
  { name: "Đơn hàng", path: "/admin/orders", icon: "🧾" },
  { name: "Thống kê", path: "/admin/stats", icon: "📈" },
  { name: "Tài khoản", path: "/admin/users", icon: "👤" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* SIDEBAR */}
      <aside
        className={`bg-white border-r shadow-sm transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        } flex flex-col`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-blue-600">
            {collapsed ? "OA" : "Office Admin"}
          </h2>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
          >
            {collapsed ? "➡" : "⬅"}
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto">
          {adminMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition ${
                  isActive ? "bg-blue-100 text-blue-600 font-semibold" : ""
                }`
              }
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen">
        {/* HEADER */}
        <header className="h-14 flex items-center justify-between px-6 bg-white border-b shadow-sm">
          <h1 className="font-semibold text-gray-700">Trang quản trị</h1>
          <UserMenu loginHref="/login" variant="admin" />
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}