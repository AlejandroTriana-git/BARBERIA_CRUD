import { useState, useEffect } from 'react';


function ReservList({ actualizarLista, onEditarReserva }) {
  const [reservas, setReservas] = useState([]);
  const [reservaDetalle, setReservaDetalle] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    cargarReservas();
  }, [actualizarLista]);

  const cargarReservas = async () => {
    try {
      const response = await fetch('http://localhost:3000/reservas');
      const data = await response.json();
      setReservas(data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    }
  };

  const verDetalle = async (idReserva) => {
    try {
      const response = await fetch(`http://localhost:3000/reservas/${idReserva}`);
      const data = await response.json();
      setReservaDetalle(data);
      setMostrarDetalle(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  };

  const cancelarReserva = async (idReserva) => {
    if (window.confirm('¿Estás seguro de eliminar esta reserva?')) {
      try {
        const response = await fetch(`http://localhost:3000/reservas/Cancelar/${idReserva}`, {
          method: 'PUT'
        });

        if (response.ok) {
          alert('✅ Reserva eliminada');
          cargarReservas();
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatearHora = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div>
      <h2>Lista de Reservas</h2>
      
      {reservas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No hay reservas registradas.
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Teléfono</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Hora</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Detalle</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(reserva => (
              <tr key={reserva.idReserva}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reserva.idReserva}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reserva.nombreCliente}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reserva.telefono}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {formatearFecha(reserva.fecha)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {formatearHora(reserva.fecha)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {reserva.detalle || 'Sin detalle'}
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
                    onClick={() => onEditarReserva(reserva)}
                    style={{
                      backgroundColor: '#FF9800',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => cancelarReserva(reserva.idReserva)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de detalle */}
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
              <strong>Cliente:</strong> {reservaDetalle.nombreCliente}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Teléfono:</strong> {reservaDetalle.telefono}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Correo:</strong> {reservaDetalle.correo}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Fecha:</strong> {formatearFecha(reservaDetalle.fecha)}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Hora:</strong> {formatearHora(reservaDetalle.fecha)}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Detalle:</strong> {reservaDetalle.detalle || 'Sin detalle'}
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
                    Barbero: {reservaDetalle.nombreBarbero}<br />  
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


export default ReservList;