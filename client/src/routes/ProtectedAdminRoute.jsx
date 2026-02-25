import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("admin_token");

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // If token exists, show the requested page
  return children;
};

export default ProtectedAdminRoute;
