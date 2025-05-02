import React from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};


export default ProtectedRoute;