import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import "./admin.css";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-container">
      
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        
        {/* Logo */}
        <div className="admin-logo">
          <h2 className="logo-text">📘 Office Admin</h2>


          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "➡" : "⬅"}
          </button>
        </div>

        {/* Menu */}
        <nav className="admin-menu">
          
        <NavLink to="/admin" end className="admin-link" data-title="Dashboard">
  🏠          <span className="link-text">Dashboard</span>
        </NavLink>

        <NavLink to="/admin/products" className="admin-link" data-title="Sản phẩm">
          📦 <span className="link-text">Sản phẩm</span>
        </NavLink>

        <NavLink to="/admin/orders" className="admin-link" data-title="Đơn hàng">
          🧾 <span className="link-text">Đơn hàng</span>
        </NavLink>

        </nav>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-header">
          <h1>Trang quản trị</h1>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}