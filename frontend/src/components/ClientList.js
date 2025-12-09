// Importamos React y los hooks necesarios
import React, { useEffect, useState } from "react";

/**
 * Componente ClientList
 * -----------------------
 * Muestra la lista de clients obtenidos desde la API del backend.
 * Permite eliminar clients y notificar al componente padre cuando se desea editar uno.
 *
 * Props:
 *  - onEdit: función callback que recibe el cliente seleccionado para editar.
 */
function ClientList({ onEdit }) {
  // -------------------- ESTADO --------------------
  // clients almacena el listado de clients cargados desde la API.
  const [clients, setClients] = useState([]);

  // -------------------- FUNCIÓN DE CARGA --------------------
  // Esta función obtiene la lista completa de clients desde el backend.
  const fetchClients = () => {
    fetch("http://localhost:3000/usuarios")
      .then((res) => res.json()) // Convertimos la respuesta a JSON
      .then((data) => setClients(data)) // Guardamos los clients en el estado
      .catch((err) => console.error("Error:", err)); // Mostramos errores si ocurren
  };

  // -------------------- useEffect --------------------
  // Este efecto se ejecuta una sola vez al montar el componente ([] como dependencia vacía)
  // Llama a fetchClients() para cargar los datos iniciales desde la API.
  useEffect(() => {
    fetchClients();
  }, []);

  // -------------------- FUNCIÓN ELIMINAR --------------------
  // handleDelete recibe el ID del cliente a eliminar.
  // Pide confirmación al usuario y, si acepta, envía la solicitud DELETE al backend.
  const handleDelete = (id) => {
    // Confirmación para evitar eliminaciones accidentales
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;

    // Petición DELETE al servidor
    fetch(`http://localhost:3000/usuarios/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        alert("Cliente eliminado"); // Mensaje de confirmación
        fetchClients(); // Recargamos la lista para reflejar el cambio
      })
      .catch((err) => console.error("Error al eliminar:", err));
  };

  // -------------------- RENDERIZADO --------------------
  // Muestra un mensaje si no hay clients o una tabla si existen registros.
  return (
    <div>
      <h2>Lista de Clientes</h2>

      {/* Si no hay clients, mostrar un mensaje */}
      {clients.length === 0 ? (
        <p>No hay clients registrados.</p>
      ) : (
        // Si hay clients, renderizamos una tabla HTML sencilla
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>telefono</th>
              
            </tr>
          </thead>

          <tbody>
            {/* Recorremos el arreglo de clients */}
            {clients.map((emp) => (
              // Cada fila debe tener una key única (usamos emp._id o emp.id)
              <tr key={emp.idCliente}>
                <td>{emp.nombre}</td>
                <td>{emp.correo}</td>
                <td>{emp.telefono}</td>
                
                <td>
                  {/* Botón Editar: llama a onEdit pasando el cliente seleccionado */}
                  <button onClick={() => onEdit(emp)}>Editar</button>

                  {/* Botón Eliminar: llama a handleDelete con el ID del cliente */}
                  <button
                    onClick={() => handleDelete(emp.idCliente)}
                    style={{ marginLeft: "10px" }} // Espacio visual entre botones
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

// Exportamos el componente para que pueda usarse en App.js u otros componentes
export default ClientList;