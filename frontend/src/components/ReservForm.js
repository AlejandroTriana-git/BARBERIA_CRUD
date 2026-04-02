import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

function ReservForm({ reservaEditar, onReservaCreada, onCancelarEdicion }) {
  const { user } = useAuth();

  // Estados para los datos del formulario
  const [barberos, setBarberos] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Estados del formulario
  const [idBarbero, setIdBarbero] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [detalle, setDetalle] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [duracionTotal, setDuracionTotal] = useState(0);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar barberos al montar el componente
  useEffect(() => {
    cargarBarberos();
  }, []);

  // Si hay una reserva para editar, cargar sus datos
  useEffect(() => {
    if (reservaEditar) {
      cargarDatosReserva(reservaEditar);
    } else {
      limpiarFormulario();
    }
  }, [reservaEditar]);

  // Cargar servicios cuando se selecciona un barbero
  useEffect(() => {
    if (idBarbero && !reservaEditar) {
      cargarServiciosBarbero(idBarbero);
    } else if (!idBarbero) {
      setServiciosDisponibles([]);
      setServiciosSeleccionados([]);
      setHorariosDisponibles([]);
    }
  }, [idBarbero]);

  // Cargar horarios disponibles cuando cambian: barbero, fecha o servicios
  useEffect(() => {
    if (idBarbero && fecha && serviciosSeleccionados.length > 0) {
      cargarHorariosDisponibles();
    } else {
      setHorariosDisponibles([]);
      setHora('');
    }
  }, [idBarbero, fecha, serviciosSeleccionados]);

  // Limpia duracionTotal y mensaje cuando ya no hay servicios seleccionados
  useEffect(() => {
    if (serviciosSeleccionados.length === 0) {
      setDuracionTotal(0);
      setMensaje('');
      setHorariosDisponibles([]);
      setHora('');
    }
  }, [serviciosSeleccionados]);

  const cargarDatosReserva = async (reserva) => {
    try {
      console.log("📝 Cargando datos de reserva:", reserva);

      if (!reserva.idReserva) {
        console.error("❌ Error: La reserva no tiene idReserva", reserva);
        setMensaje("Error: No se puede cargar la reserva sin ID");
        return;
      }

      const data = await apiClient.get(`/reservas/${reserva.idReserva}/cliente`);
      console.log("✅ Datos recibidos del servidor:", data);

      setIdBarbero(String(data.idBarbero || ''));

      // Manejar fecha y hora - usar fechaReserva si existe, sino fecha
      const fechaField = data.fechaReserva || data.fecha;
      if (fechaField) {
        const fechaStr = String(fechaField);

        if (fechaStr.includes('T')) {
          const [isoDate, isoTime] = fechaStr.split('T');
          setFecha(isoDate);
          setHora((isoTime || '').substring(0, 5));
        } else if (fechaStr.includes(' ')) {
          const [d, t] = fechaStr.split(' ');
          setFecha(d);
          setHora((t || '').substring(0, 5));
        } else {
          const dObj = new Date(fechaStr);
          if (!isNaN(dObj)) {
            const yyyy = dObj.getFullYear();
            const mm = String(dObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dObj.getDate()).padStart(2, '0');
            const hh = String(dObj.getHours()).padStart(2, '0');
            const min = String(dObj.getMinutes()).padStart(2, '0');

            setFecha(`${yyyy}-${mm}-${dd}`);
            setHora(`${hh}:${min}`);
          }
        }
      }

      // Usar detalleReserva si existe, sino detalle
      const detailField = data.detalleReserva || data.detalle;
      setDetalle(detailField && detailField !== 'NULL' ? detailField : '');

      // Cargar servicios del barbero
      if (data.idBarbero) {
        try {
          const respServicios = await apiClient.get(`/barberos/${data.idBarbero}/servicios`);
          setServiciosDisponibles(respServicios || []);

          if (data.servicios && Array.isArray(data.servicios)) {
            const serviciosIds = data.servicios.map(s => Number(s.idServicio));
            setServiciosSeleccionados(serviciosIds);
          }
        } catch (err) {
          console.error('Error al cargar servicios:', err);
          setServiciosSeleccionados([]);
        }
      }
    } catch (err) {
      console.error('Error al cargar datos de reserva:', err);
      setMensaje('❌ Error al cargar la reserva: ' + err.message);
    }
  };

  const cargarBarberos = async () => {
    try {
      const data = await apiClient.get('/barberos');
      setBarberos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar barberos:', err);
      setMensaje('Error al cargar barberos: ' + err.message);
    }
  };

  const cargarServiciosBarbero = async (idBarbero) => {
    try {
      const data = await apiClient.get(`/barberos/${idBarbero}/servicios`);
      setServiciosDisponibles(Array.isArray(data) ? data : []);

      if (!reservaEditar) {
        setServiciosSeleccionados([]);
      }
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setServiciosDisponibles([]);
    }
  };

  const cargarHorariosDisponibles = async () => {
    setCargandoHorarios(true);
    try {
      const serviciosQuery = serviciosSeleccionados.join(',');
      const data = await apiClient.get(
        `/disponibilidad?idBarbero=${idBarbero}&fecha=${fecha}&servicios=${serviciosQuery}`
      );

      if (data.horariosDisponibles) {
        setHorariosDisponibles(data.horariosDisponibles);
        setDuracionTotal(data.duracionTotal ?? 0);

        if (data.horariosDisponibles.length === 0 && data.mensaje) {
          if (!reservaEditar) setMensaje(data.mensaje);
        } else {
          setMensaje('');
        }
      } else {
        setHorariosDisponibles([]);
        setDuracionTotal(0);
        setMensaje(data.mensaje || 'No hay horarios disponibles');
      }
    } catch (err) {
      console.error('Error al cargar horarios:', err);
      setMensaje('Error: ' + err.message);
      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const toggleServicio = (idServicio) => {
    setServiciosSeleccionados(prev => {
      if (prev.includes(idServicio)) {
        return prev.filter(id => id !== idServicio);
      } else {
        return [...prev, idServicio];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idBarbero || !fecha || !hora || serviciosSeleccionados.length === 0) {
      window.alert('Por favor completa todos los campos y selecciona al menos un servicio');
      return;
    }

    // Obtener nombres para confirmación
    const barberoSeleccionado = barberos.find(b => b.idBarbero === parseInt(idBarbero));
    const nombreBarbero = barberoSeleccionado ? barberoSeleccionado.nombreBarbero : 'Barbero';

    const nombresServicios = serviciosDisponibles
      .filter(s => serviciosSeleccionados.includes(s.idServicio))
      .map(s => s.nombreServicio)
      .join(', ');

    const mensaje = `¿Confirmar reserva?

Barbero: ${nombreBarbero}
Fecha: ${fecha}
Hora: ${hora}
Servicios: ${nombresServicios}
Duración total: ${duracionTotal} minutos`;

    if (!window.confirm(mensaje)) {
      return;
    }

    // Procesar la reserva
    const fechaHoraCompleta = `${fecha} ${hora}:00`;

    const reservaData = {
      idBarbero: parseInt(idBarbero),
      fechaHora: fechaHoraCompleta,
      detalle: detalle || 'Sin comentarios',
      servicios: serviciosSeleccionados
    };

    try {
      setLoading(true);

      if (reservaEditar) {
        await apiClient.put(`/reservas/${reservaEditar.idReserva}`, reservaData);
        window.alert('✅ Reserva actualizada exitosamente');
      } else {
        await apiClient.post('/reservas', reservaData);
        window.alert('✅ Reserva creada exitosamente');
      }

      limpiarFormulario();
      if (onReservaCreada) onReservaCreada();
      if (onCancelarEdicion) onCancelarEdicion();
    } catch (err) {
      console.error('Error al guardar reserva:', err);
      window.alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setIdBarbero('');
    setServiciosSeleccionados([]);
    setServiciosDisponibles([]);
    setFecha('');
    setHora('');
    setDetalle('');
    setHorariosDisponibles([]);
    setDuracionTotal(0);
    setMensaje('');
  };

  const handleCancelar = () => {
    limpiarFormulario();
    if (onCancelarEdicion) onCancelarEdicion();
  };

  return (
    <div style={{
      border: '2px solid #ddd',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '8px',
      backgroundColor: reservaEditar ? '#fff9e6' : 'white'
    }}>
      <h2>{reservaEditar ? '✏️ Editar Reserva #' + reservaEditar.idReserva : 'Nueva Reserva'}</h2>

      {mensaje && (
        <div style={{
          padding: '10px',
          backgroundColor: mensaje.includes('Error') ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Seleccionar Barbero */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Barbero: *
          </label>
          <select
            value={idBarbero}
            onChange={(e) => setIdBarbero(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            required
            disabled={!!reservaEditar || loading}
          >
            <option value="">-- Selecciona un barbero --</option>
            {barberos.map(barbero => (
              <option key={barbero.idBarbero} value={barbero.idBarbero}>
                {barbero.nombreBarbero || barbero.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Servicios disponibles */}
        {serviciosDisponibles.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Servicios (selecciona uno o varios): *
            </label>
            <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
              {serviciosDisponibles.map(servicio => (
                <div key={servicio.idServicio} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={serviciosSeleccionados.includes(servicio.idServicio)}
                      onChange={() => toggleServicio(servicio.idServicio)}
                      style={{ marginRight: '10px' }}
                      disabled={!!reservaEditar || loading}
                    />
                    <span>
                      <strong>{servicio.nombreServicio}</strong> -
                      ${servicio.costo} - {servicio.duracion} min
                    </span>
                  </label>
                </div>
              ))}
            </div>
            {duracionTotal > 0 && (
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                ⏱️ Duración total: {duracionTotal} minutos
              </div>
            )}
          </div>
        )}

        {/* Fecha */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Fecha: *
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            required
            disabled={loading}
          />
        </div>

        {/* Hora */}
        {serviciosSeleccionados.length > 0 && fecha && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Hora: *
            </label>
            {cargandoHorarios ? (
              <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                ⏳ Cargando horarios disponibles...
              </div>
            ) : horariosDisponibles.length > 0 ? (
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                required
                disabled={loading}
              >
                <option value="">-- Selecciona un horario --</option>
                {horariosDisponibles.map(horario => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
                ❌ No hay horarios disponibles para esta fecha y servicios.
              </div>
            )}
          </div>
        )}

        {/* Detalle */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Detalle (opcional):
          </label>
          <textarea
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Escribe algún detalle adicional..."
            style={{ width: '99%', padding: '8px', fontSize: '14px', minHeight: '80px' }}
            disabled={loading}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              backgroundColor: reservaEditar ? '#FF9800' : '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
            disabled={loading}
          >
            {loading ? 'Guardando...' : (reservaEditar ? 'Actualizar Reserva' : 'Crear Reserva')}
          </button>

          {!reservaEditar && (
            <button
              type="button"
              onClick={limpiarFormulario}
              style={{
                backgroundColor: '#757575',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              disabled={loading}
            >
              Limpiar
            </button>
          )}

          {reservaEditar && (
            <button
              type="button"
              onClick={handleCancelar}
              style={{
                backgroundColor: '#757575',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              disabled={loading}
            >
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReservForm;
