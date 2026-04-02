import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * PrivateRoute - Componente para proteger rutas
 * Verifica autenticación antes de renderizar componente
 * Opcionalmente puede verificar rol requerido
 */
function PrivateRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mientras se carga la sesión
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y no coincide
  if (requiredRole && user?.rol !== requiredRole) {
    // Redirigir a la página según su rol
    if (user?.rol === 3) {
      return <Navigate to="/admin" replace />;
    } else if (user?.rol === 1) {
      return <Navigate to="/" replace />;
    } else if (user?.rol === 2) {
      return <Navigate to="/barbero" replace />;
    }
    // Fallback si no hay rol definido
    return <Navigate to="/login" replace />;
  }

  // Renderizar el componente
  return children;
}

export default PrivateRoute;
