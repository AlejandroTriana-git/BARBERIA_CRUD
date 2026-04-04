import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../services/apiClient";

function PerfilUsuario() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si es cliente (rol 1), cargar perfil detallado de /clientes
      if (user?.rol === 1) {
        const data = await apiClient.get("/clientes");
        setProfileData(data);
      } else {
        // Para admin (rol 3) u otros, no necesita datos adicionales
        setProfileData(null);
      }
    } catch (err) {
      console.error("Error al obtener perfil:", err);
      // Para admin, si no es cliente, esto es esperado
      if (user?.rol !== 1) {
        setError(null);
        setProfileData(null);
      } else {
        setError(err.message || "Error al cargar perfil");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: {error}
        <button onClick={fetchProfile} style={{ marginLeft: "10px" }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Mi Perfil</h1>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        {user?.rol === 1 && profileData && (
          <>
            <div style={{ marginBottom: "15px" }}>
              <strong>Nombre:</strong> {profileData?.nombreCliente || "No disponible"}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Teléfono:</strong> {profileData?.telefonoCliente || "No disponible"}
            </div>
             
          </>
        )}

        <div style={{ marginBottom: "15px" }}>
          <strong>Correo:</strong> {user?.email}
        </div>

        {user?.rol === 1 && (
          <div style={{ marginBottom: "20px" }}>
            <strong>Rol:</strong> Cliente
          </div>
        )}

        {user?.rol === 3 && (
          <div style={{ marginBottom: "20px" }}>
            <strong>Rol:</strong> Administrador
          </div>
        )}

        {user?.rol === 2 && (
          <div style={{ marginBottom: "20px" }}>
            <strong>Rol:</strong> Barbero
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {user?.rol === 1 && (
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ✏️ Editar Perfil
            </button>
          )}

          <button
            onClick={() => setShowChangePasswordModal(true)}
            style={{
              backgroundColor: "#FF9800",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            🔒 Cambiar Contraseña
          </button>

          <button
            onClick={() => setShowChangeEmailModal(true)}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            📧 Cambiar Email
          </button>
        </div>
      </div>

      {/* Modal Editar Perfil */}
      {showEditModal && user?.rol === 1 && (
        <ModalEditarPerfil
          profileData={profileData}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchProfile();
          }}
        />
      )}

      {/* Modal Cambiar Contraseña */}
      {showChangePasswordModal && (
        <ModalCambiarContraseña
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => setShowChangePasswordModal(false)}
        />
      )}

      {/* Modal Cambiar Email */}
      {showChangeEmailModal && (
        <ModalCambiarEmail
          onClose={() => setShowChangeEmailModal(false)}
          onSuccess={() => {
            setShowChangeEmailModal(false);
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}

// Modal Editar Perfil
function ModalEditarPerfil({ profileData, onClose, onSuccess }) {
  const [nombre, setNombre] = useState(profileData?.nombreCliente || "");
  const [telefono, setTelefono] = useState(profileData?.telefonoCliente || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]+$/.test(telefono) || telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    try {
      setSaving(true);
      await apiClient.put("/clientes", {
        nombreCliente: nombre.trim(),
        telefonoCliente: telefono.trim(),
      });
      alert("✅ Perfil actualizado");
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <h2>Editar Perfil</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Nombre:
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              required
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Teléfono:
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              maxLength="10"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              required
              disabled={saving}
            />
          </div>

          {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                backgroundColor: "#666",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Cambiar Contraseña
function ModalCambiarContraseña({ onClose, onSuccess }) {
  const [contraseñaAntigua, setContraseñaAntigua] = useState("");
  const [contraseñaNueva, setContraseñaNueva] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!contraseñaAntigua) {
      setError("La contraseña actual es requerida");
      return;
    }

    if (!contraseñaNueva) {
      setError("La contraseña nueva es requerida");
      return;
    }

    if (contraseñaNueva !== confirmarContraseña) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (contraseñaNueva.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      setSaving(true);
      await apiClient.post("/usuarios/contrasena", {
        contraseñaAntigua,
        contraseñaNueva,
      });
      alert("✅ Contraseña actualizada");
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <h2>Cambiar Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Contraseña Actual:
            </label>
            <input
              type="password"
              value={contraseñaAntigua}
              onChange={(e) => setContraseñaAntigua(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              required
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Contraseña Nueva:
            </label>
            <input
              type="password"
              value={contraseñaNueva}
              onChange={(e) => setContraseñaNueva(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              required
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Confirmar Contraseña:
            </label>
            <input
              type="password"
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              required
              disabled={saving}
            />
          </div>

          {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Cambiar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                backgroundColor: "#666",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Cambiar Email
function ModalCambiarEmail({ onClose, onSuccess }) {
  const [correoNuevo, setCorreoNuevo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNuevo)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    if (!contraseña) {
      setError("La contraseña es requerida");
      return;
    }

    try {
      setSaving(true);
      await apiClient.put("/usuarios/correo", {
        correoNuevo,
        contraseña,
      });
      alert("✅ Email actualizado");
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al cambiar email");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <h2>Cambiar Email</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Email Nuevo:
            </label>
            <input
              type="email"
              value={correoNuevo}
              onChange={(e) => setCorreoNuevo(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              required
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Contraseña (para confirmar):
            </label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              required
              disabled={saving}
            />
          </div>

          {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Cambiar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                backgroundColor: "#666",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PerfilUsuario;
