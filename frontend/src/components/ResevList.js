import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

function ResevList({ actualizarLista, onEditarReserva }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [reservaDetalle, setReservaDetalle] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarReservas();
  }, [actualizarLista, filtroEstado]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/reservas';
      if (filtroEstado) {
        url += `?estado=${filtroEstado}`;
      }
      const data = await apiClient.get(url);

      if (Array.isArray(data)) {
        setReservas(data);
      } else if (data.message) {
        setReservas([]);
      } else {
        setReservas([]);
      }
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError(err.message || 'Error al cargar reservas');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (idReserva) => {
    try {
      const data = await apiClient.get(`/reservas/${idReserva}/cliente`);
      setReservaDetalle(data);
      setMostrarDetalle(true);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      alert('Error al cargar detalle: ' + err.message);
    }
  };

  const cancelarReserva = async (idReserva) => {
    const motivo = window.prompt("Indica el motivo de cancelación:");

    if (motivo === null || motivo.trim() === "") {
      alert("⚠️ Debes ingresar un motivo para cancelar la reserva.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro quieres cancelar la reserva?\nMotivo: ${motivo}`
    );

    if (!confirmar) return;

    try {
      await apiClient.put(`/reservas/${idReserva}/cancelar`, { motivo });
      alert('✅ Reserva cancelada exitosamente');
      cargarReservas();
    } catch (err) {
      console.error('Error al cancelar:', err);
      alert('❌ ' + (err.message || 'Error desconocido'));
    }
  };

  const handleEditarReserva = (reserva) => {
    onEditarReserva(reserva);
  };

  const formatearFecha = (fechaStr) => {
    try {
      const date = new Date(fechaStr);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Fecha inválida';
    }
  };

  const formatearHora = (fechaStr) => {
    try {
      const date = new Date(fechaStr);
      if (isNaN(date.getTime())) {
        return 'Hora inválida';
      }
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Hora inválida';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 0:
        return 'Cancelada';
      case 1:
        return 'Pendiente';
      case 2:
        return 'No asistió';
      case 3:
        return 'Realizado';
      default:
        return 'Desconocido';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 0:
        return '#f44336';
      case 1:
        return '#4CAF50';
      case 2:
        return '#FF9800';
      case 3:
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const puedeEditar = (estado) => estado === 1;

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando reservas...</div>;
  }

  return (
    <div>
      <h2>Mis Reservas</h2>

      {error && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Filtrar por estado:
        </label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">-- Ver todas --</option>
          <option value="pendiente">Pendiente</option>
          <option value="realizadas">Realizadas</option>
          <option value="sin asistir">No asistió</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {reservas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No tienes reservas registradas.
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Barbero</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Hora</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Estado</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(reserva => (
              <tr key={reserva.idReserva}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reserva.idReserva}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {reserva.nombreBarbero || 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {formatearFecha(reserva.fechaReserva)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {formatearHora(reserva.fechaReserva)}
                </td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: getEstadoColor(reserva.estadoReserva)
                }}>
                  {getEstadoLabel(reserva.estadoReserva)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button
                    onClick={() => verDetalle(reserva.idReserva)}
                    style={{
                      backgroundColor: '#2196F3',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => handleEditarReserva(reserva)}
                    disabled={!puedeEditar(reserva.estadoReserva)}
                    style={{
                      backgroundColor: puedeEditar(reserva.estadoReserva) ? '#FF9800' : '#ccc',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: puedeEditar(reserva.estadoReserva) ? 'pointer' : 'not-allowed',
                      marginRight: '5px'
                    }}
                    title={puedeEditar(reserva.estadoReserva) ? 'Editar' : 'Solo se pueden editar reservas pendientes'}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => cancelarReserva(reserva.idReserva)}
                    disabled={!puedeEditar(reserva.estadoReserva)}
                    style={{
                      backgroundColor: puedeEditar(reserva.estadoReserva) ? '#f44336' : '#ccc',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: puedeEditar(reserva.estadoReserva) ? 'pointer' : 'not-allowed'
                    }}
                    title={puedeEditar(reserva.estadoReserva) ? 'Cancelar' : 'Solo se pueden cancelar reservas pendientes'}
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarDetalle && reservaDetalle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Detalle de Reserva #{reservaDetalle.idReserva}</h2>

            <div style={{ marginBottom: '15px' }}>
              <strong>Barbero:</strong> {reservaDetalle.nombreBarbero}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Fecha:</strong> {formatearFecha(reservaDetalle.fechaReserva || reservaDetalle.fecha)}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Hora:</strong> {formatearHora(reservaDetalle.fechaReserva || reservaDetalle.fecha)}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Estado:</strong>{' '}
              <span style={{ color: getEstadoColor(reservaDetalle.estadoReserva) }}>
                {getEstadoLabel(reservaDetalle.estadoReserva)}
              </span>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Detalle:</strong> {reservaDetalle.detalleReserva || 'Sin detalle'}
            </div>

            <h3>Servicios:</h3>
            {reservaDetalle.servicios && reservaDetalle.servicios.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {reservaDetalle.servicios.map((servicio, index) => (
                  <li key={index} style={{
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '8px',
                    borderRadius: '4px'
                  }}>
                    <strong>{servicio.nombreServicio}</strong><br />
                    Duración: {servicio.duracion} min - Costo: ${servicio.costo}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay servicios registrados.</p>
            )}

            <button
              onClick={() => setMostrarDetalle(false)}
              style={{
                backgroundColor: '#666',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResevList;
