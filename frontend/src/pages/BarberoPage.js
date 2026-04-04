import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../services/apiClient";
import PerfilUsuario from "../components/PerfilUsuario";

function BarberoPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  useEffect(() => {
    if (activeTab === "agenda") {
      cargarAgenda();
    }
  }, [activeTab]);

  const cargarAgenda = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get("/reservas/agenda");
      setAgenda(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar agenda:", err);
      setError(err.message || "Error al cargar la agenda");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (idReserva, nuevoEstado) => {
    try {
      console.log("📊 Enviando cambio de estado:", { idReserva, estado: nuevoEstado });
      const response = await apiClient.put(`/reservas/${idReserva}/estado`, {
        estado: parseInt(nuevoEstado)
      });
      console.log("✅ Respuesta del servidor:", response);
      alert("✅ Estado actualizado");
      cargarAgenda();
      setReservaSeleccionada(null);
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      alert("❌ Error: " + err.message);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      0: "#f44336",
      1: "#4CAF50",
      2: "#ff9800",
      3: "#2196F3"
    };
    return colores[estado] || "#999";
  };

  const getEstadoNombre = (estado) => {
    const nombres = {
      0: "Cancelada",
      1: "Pendiente",
      2: "No asistió",
      3: "Realizado"
    };
    return nombres[estado] || "Desconocido";
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Portal del Barbero</h1>

      {/* Navegación de pestañas */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", borderBottom: "2px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("perfil")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "perfil" ? "#667eea" : "#ddd",
            color: activeTab === "perfil" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "perfil" ? "bold" : "normal",
          }}
        >
          👤 Mi Perfil
        </button>
        <button
          onClick={() => setActiveTab("agenda")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "agenda" ? "#667eea" : "#ddd",
            color: activeTab === "agenda" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "agenda" ? "bold" : "normal",
          }}
        >
          📅 Mi Agenda
        </button>
      </div>

      {/* Contenido por pestaña */}
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", minHeight: "400px" }}>
        {activeTab === "perfil" && <PerfilUsuario />}

        {activeTab === "agenda" && (
          <div>
            <h2>Mi Agenda de Reservas</h2>

            {loading && <p>Cargando agenda...</p>}
            {error && <div style={{ color: "red", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>{error}</div>}

            {!loading && !error && agenda.length === 0 && (
              <p style={{ color: "#666" }}>No tienes reservas programadas</p>
            )}

            {!loading && !error && agenda.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Cliente</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Fecha y Hora</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Servicios</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Estado</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {agenda.map(reserva => (
                    <tr key={reserva.idReserva}>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{reserva.nombreCliente}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{formatearFecha(reserva.fechaReserva)}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd", fontSize: "14px" }}>{reserva.servicios}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                        <span style={{
                          backgroundColor: getEstadoColor(reserva.estadoReserva),
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px"
                        }}>
                          {getEstadoNombre(reserva.estadoReserva)}
                        </span>
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                        <button
                          onClick={() => setReservaSeleccionada(reserva)}
                          style={{
                            backgroundColor: "#2196F3",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Ver más
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Modal de detalles */}
            {reservaSeleccionada && (
              <ModalDetallesReserva
                reserva={reservaSeleccionada}
                onClose={() => setReservaSeleccionada(null)}
                onCambiarEstado={cambiarEstado}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Modal de detalles
function ModalDetallesReserva({ reserva, onClose, onCambiarEstado }) {
  const getEstadoColor = (estado) => {
    const colores = {
      0: "#f44336",
      1: "#4CAF50",
      2: "#ff9800",
      3: "#2196F3"
    };
    return colores[estado] || "#999";
  };

  const getEstadoNombre = (estado) => {
    const nombres = {
      0: "Cancelada",
      1: "Pendiente",
      2: "No asistió",
      3: "Realizado"
    };
    return nombres[estado] || "Desconocido";
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "8px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h2>Detalles de la Reserva #{reserva.idReserva}</h2>

        <div style={{ marginBottom: "15px" }}>
          <strong>Cliente:</strong> {reserva.nombreCliente}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong>Fecha y Hora:</strong> {formatearFecha(reserva.fechaReserva)}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong>Servicios:</strong> {reserva.servicios}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong>Detalles:</strong>
          <p style={{ marginTop: "5px", color: "#666" }}>{reserva.detalleReserva || "Sin comentarios"}</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <strong>Estado:</strong>
          <div style={{
            backgroundColor: getEstadoColor(reserva.estadoReserva),
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            marginTop: "5px",
            display: "inline-block"
          }}>
            {getEstadoNombre(reserva.estadoReserva)}
          </div>
        </div>

        {/* Botones de acción */}
        {reserva.estadoReserva === 1 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => {
                console.log("✅ Click en Completada, pasando estado: 3");
                onCambiarEstado(reserva.idReserva, 3);
              }}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                flex: 1
              }}
            >
              ✅ Completada
            </button>
            <button
              onClick={() => {
                console.log("❌ Click en No asistió, pasando estado: 2");
                onCambiarEstado(reserva.idReserva, 2);
              }}
              style={{
                backgroundColor: "#ff9800",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                flex: 1
              }}
            >
              ❌ No asistió
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            backgroundColor: "#666",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// Funciones auxiliares
const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-ES") + " " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

const getEstadoColor = (estado) => {
  const colores = {
    0: "#f44336",
    1: "#4CAF50",
    2: "#ff9800",
    3: "#2196F3"
  };
  return colores[estado] || "#999";
};

const getEstadoNombre = (estado) => {
  const nombres = {
    0: "Cancelada",
    1: "Pendiente",
    2: "No asistió",
    3: "Realizado"
  };
  return nombres[estado] || "Desconocido";
};

export default BarberoPage;
