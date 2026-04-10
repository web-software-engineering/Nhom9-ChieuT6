import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
export default function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("accessToken");

  // nếu chưa login → đá về login
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const user = jwtDecode(token);
    if (requiredRole && user?.role !== requiredRole) {
      return <Navigate to="/" />;
    }
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return <Navigate to="/login" />;
  }

  return children;
}

export function AdminRoute({ children }) {
  return <PrivateRoute requiredRole="admin">{children}</PrivateRoute>;
}
