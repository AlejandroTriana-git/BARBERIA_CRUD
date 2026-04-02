import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay sesión guardada al montar
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar sesión guardada en localStorage
  const checkAuth = () => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("authUser");
      const tokenExpires = localStorage.getItem("tokenExpires");

      if (storedToken && storedUser && tokenExpires) {
        // Verificar si el token ya expiró
        const expirationTime = parseInt(tokenExpires);
        if (Date.now() > expirationTime) {
          // Token expirado
          clearSession();
        } else {
          // Token válido, restaurar sesión
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (err) {
      console.error("Error al restaurar sesión:", err);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (correo, contraseña) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/auth/verificar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contraseña }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Error al iniciar sesión";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { tokenWeb, user: userData } = data;

      // Calcular expiration time (8 horas desde ahora)
      const expirationTime = Date.now() + 8 * 60 * 60 * 1000;

      // Guardar en localStorage
      localStorage.setItem("authToken", tokenWeb);
      localStorage.setItem("authUser", JSON.stringify(userData));
      localStorage.setItem("tokenExpires", expirationTime.toString());

      // Actualizar state
      setToken(tokenWeb);
      setUser(userData);

      return userData;
    } catch (err) {
      const errorMsg = err.message || "Error desconocido";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Registro de cliente
  const register = async (
    nombreCliente,
    telefonoCliente,
    correoUsuario,
    contraseña
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/auth/registrarCliente`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreCliente,
            telefonoCliente,
            correoUsuario,
            contraseña,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Error al registrar";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error desconocido";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    clearSession();
  };

  // Limpiar sesión
  const clearSession = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("tokenExpires");
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Limpiar error
  const clearError = () => {
    setError(null);
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
