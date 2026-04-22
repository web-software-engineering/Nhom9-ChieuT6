import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import UserMenu from "../components/UserMenu";
import "./admin.css";

const adminMenuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
  { name: "Danh mục", path: "/admin/categories", icon: "📁" },
  { name: "Sản phẩm", path: "/admin/products", icon: "📦" },
  { name: "Đơn hàng", path: "/admin/orders", icon: "🧾" },
  { name: "Thống kê", path: "/admin/stats", icon: "📈" },
  { name: "Tài khoản", path: "/admin/users", icon: "👤" }, // 👈 thêm trang user
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="admin-logo">
          <h2 className="logo-text">
            {collapsed ? "OA" : "Office Admin"}
          </h2>

          <button
            type="button"
            className="toggle-btn"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? "➡" : "⬅"}
          </button>
        </div>

        <nav className="admin-menu">
          {adminMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                "admin-link " + (isActive ? "active" : "")
              }
            >
              <span className="icon">{item.icon}</span>

              {!collapsed && (
                <span className="link-text">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-header">
          <h1>Trang quản trị</h1>
          <UserMenu loginHref="/login" variant="admin" />
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}