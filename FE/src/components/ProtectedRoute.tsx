import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  useEffect(() => {
  if (!token) {
    toast.warning("로그인이 필요한 기능입니다.", {
      toastId: "login-required"
    });
  }
}, [token]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}