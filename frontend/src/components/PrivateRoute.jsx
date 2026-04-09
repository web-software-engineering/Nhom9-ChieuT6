import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  // nếu chưa login → đá về login
  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  if (!token) return <Navigate to="/login" />;

  const user = jwtDecode(token);

  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}
