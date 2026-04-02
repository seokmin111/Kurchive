import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("admin_token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  return children;
}