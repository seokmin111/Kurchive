import { Navigate, Outlet, useLocation } from "react-router-dom";

// 공개(로그인 없이 접근 허용) 경로만 여기서 관리
const PUBLIC_PATHS = [
  "/login",
  "/restaurant",
  "/recipe"
];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export default function ProtectedRoute() {
  const location = useLocation();
  const path = location.pathname;

  // 1) 공개 경로는 무조건 통과
  if (isPublicPath(path)) return <Outlet />;

  // 2) 나머지는 토큰 없으면 로그인으로
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace state={{ from: path }} />;
  }

  // 3) 토큰 있으면 통과
  return <Outlet />;
}
