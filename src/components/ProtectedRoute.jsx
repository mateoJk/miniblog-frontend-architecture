import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * <ProtectedRoute roles={['admin','moderator']}>
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    // Si no tiene el rol requerido
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}