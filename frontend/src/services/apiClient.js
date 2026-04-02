/**
 * API Client - Wrapper centralizado para fetch API
 * Inyecta JWT token automáticamente en todas las peticiones
 * Maneja errores 401 (token expirado)
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Helper para obtener token de localStorage
const getToken = () => {
  return localStorage.getItem("authToken");
};

// Helper para limpiar sesión
const clearSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("tokenExpires");
  // Redirigir a login
  window.location.href = "/login";
};

// Helper para extraer mensaje de error de la respuesta
const extractErrorMessage = async (response) => {
  try {
    const data = await response.json();
    // Prioridad: mensaje > error > message
    return data.mensaje || data.error || data.message || `Error ${response.status}`;
  } catch (e) {
    // Si no es JSON válido, devolver estado HTTP
    return `Error ${response.status}`;
  }
};

// Helper para hacer peticiones con JWT
const fetchWithToken = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Si recibimos 401, significa que el token expiró o es inválido
  if (response.status === 401) {
    clearSession();
    throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
  }

  // Si no es ok, extraer el mensaje de error del backend
  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response);
    throw new Error(errorMessage);
  }

  // Intentar parsear como JSON, si falla retornar respuesta
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    return response;
  }
};

// Métodos del API Client
const apiClient = {
  get: (endpoint, options = {}) => {
    return fetchWithToken(endpoint, { ...options, method: "GET" });
  },

  post: (endpoint, data = {}, options = {}) => {
    return fetchWithToken(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put: (endpoint, data = {}, options = {}) => {
    return fetchWithToken(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint, options = {}) => {
    return fetchWithToken(endpoint, { ...options, method: "DELETE" });
  },
};

export default apiClient;
