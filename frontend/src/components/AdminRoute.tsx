import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  const adminUser = sessionStorage.getItem("adminUser"); // ✅ đọc đúng storage
  if (!adminUser) return <Navigate to="/admin/login" replace />;
  return children;
};

export default AdminRoute;