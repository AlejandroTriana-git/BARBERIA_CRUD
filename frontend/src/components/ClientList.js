import React, { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

/**
 * Componente ClientList
 * -----------------------
 * Muestra la lista de clientes obtenidos desde la API del backend.
 * Permite eliminar clientes y notificar al componente padre cuando se desea editar uno.
 *
 * Props:
 *  - onEdit: función callback que recibe el cliente seleccionado para editar.
 */
function ClientList({ onEdit }) {
  // -------------------- ESTADO --------------------
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------- FUNCIÓN DE CARGA --------------------
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get("/clientes");
      setClients(data || []);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      setError(err.message || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- useEffect --------------------
  useEffect(() => {
    fetchClients();
  }, []);

  // -------------------- FUNCIÓN ELIMINAR --------------------
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;

    try {
      await apiClient.delete(`/clientes/${id}`);
      setClients(clients.filter((c) => c.idCliente !== id));
      alert("Cliente eliminado");
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar: " + err.message);
    }
  };

  // -------------------- RENDERIZADO --------------------
  return (
    <div>
      <h2>Lista de Clientes</h2>

      {loading && <p>Cargando...</p>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {!loading && clients.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.idCliente}>
                <td>{client.nombreCliente}</td>
                <td>{client.correoUsuario}</td>
                <td>{client.telefonoCliente}</td>

                <td>
                  <button onClick={() => onEdit(client)}>Editar</button>
                  <button
                    onClick={() => handleDelete(client.idCliente)}
                    style={{ marginLeft: "10px" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientList;