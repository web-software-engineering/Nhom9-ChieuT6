import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { Home, Box, Folder, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/admin" },
    { name: "Danh mục", icon: Folder, path: "/admin/categories" },
    { name: "Sản phẩm", icon: Box, path: "/admin/products" },
    { name: "Đơn hàng", icon: FileText, path: "/admin/orders" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className={`flex flex-col bg-white shadow-md ${collapsed ? "w-20" : "w-64"}`}>
        {/* Logo + Toggle */}
        <div className={`flex items-center border-b border-gray-200 p-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <h2 className="text-blue-600 font-bold text-lg"> Office Smart</h2>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-gray-200">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col mt-4 gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-blue-100
                 ${isActive ? "bg-blue-500 text-white" : "text-gray-700"}
                 ${collapsed ? "justify-center" : "justify-start"}`
              }
              title={collapsed ? item.name : undefined} // tooltip khi collapsed
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <h1 className="text-gray-800 font-semibold text-xl">Admin</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}