import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import UserMenu from "../components/UserMenu";
import "./admin.css";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Danh mục", path: "/admin/categories" },
  { name: "Sản phẩm", path: "/admin/products" },
  { name: "Đơn hàng", path: "/admin/orders" },
  { name: "Thống kê", path: "/admin/stats" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-container">
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="admin-logo">
          <h2 className="logo-text">Office Admin</h2>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "➡" : "⬅"}
          </button>
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="admin-link"
              data-title={item.name}
            >
              <span className="link-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

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
