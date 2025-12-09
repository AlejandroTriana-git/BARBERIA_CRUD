import { useState, useEffect } from 'react';

function ReservForm({ reservaEditar, onReservaCreada, onCancelarEdicion }) {
  // Estados para los datos del formulario
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  
  // Estados del formulario
  const [idCliente, setIdCliente] = useState('');
  const [idBarbero, setIdBarbero] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]); // Array de idServicio
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [detalle, setDetalle] = useState('');
  
  const [mensaje, setMensaje] = useState('');
  const [duracionTotal, setDuracionTotal] = useState(0);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  // Cargar clientes y barberos al montar el componente
  useEffect(() => {
    cargarClientes();
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
      // Solo cargar servicios si NO estamos editando
      // (al editar ya se cargan en cargarDatosReserva)
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
      
      
      const response = await fetch(`http://localhost:3000/reservas/${reserva.idReserva}`);
      const data = await response.json();
      
      
      
      setIdCliente(data.idCliente ?? '');

      // ======================================================================
      // MANEJAR FECHA Y HORA
      // ======================================================================
      if (data.fecha) {
        const fechaStr = String(data.fecha);

        if (fechaStr.includes('T')) {
          // Formato ISO: "2025-12-03T20:00:00.000Z"
          const [isoDate, isoTime] = fechaStr.split('T');
          setFecha(isoDate);
          setHora((isoTime || '').substring(0, 5));
        } else if (fechaStr.includes(' ')) {
          // Formato: "2025-12-03 20:00:00"
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
          } else {
            console.warn('Formato de fecha desconocido:', fechaStr);
            setFecha('');
            setHora('');
          }
        }
      } else {
        setFecha('');
        setHora('');
      }

      // Manejar detalle (puede venir como "NULL" string o null)
      setDetalle(data.detalle && data.detalle !== 'NULL' ? data.detalle : '');

      // ======================================================================
      // CARGAR SERVICIOS Y BARBERO
      // ======================================================================
      if (data.idBarbero) {
        
        setIdBarbero(String(data.idBarbero));
        
        // Esperar a que se carguen los servicios del barbero
        try {
          const respServicios = await fetch(`http://localhost:3000/barberos/${data.idBarbero}/servicios`);
          const servicios = await respServicios.json();
          
          setServiciosDisponibles(servicios);

          // Seleccionar los servicios de la reserva
          if (data.servicios && Array.isArray(data.servicios) && data.servicios.length > 0) {
            const serviciosIds = data.servicios.map(s => Number(s.idServicio));
            
            setServiciosSeleccionados(serviciosIds);
          } else {
            console.warn("No hay servicios en la reserva");
            setServiciosSeleccionados([]);
          }
        } catch (err) {
          console.error('Error al cargar servicios del barbero:', err);
          setServiciosSeleccionados([]);
        }
      } else {
        console.warn("No hay idBarbero en la reserva");
        setServiciosSeleccionados([]);
        setIdBarbero('');
      }
    } catch (error) {
      console.error('Error al cargar datos de reserva:', error);
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuarios');
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const cargarBarberos = async () => {
    try {
      const response = await fetch('http://localhost:3000/barberos');
      const data = await response.json();
      setBarberos(data);
    } catch (error) {
      console.error('Error al cargar barberos:', error);
    }
  };

  const cargarServiciosBarbero = async (idBarbero) => {
    try {
      
      const response = await fetch(`http://localhost:3000/barberos/${idBarbero}/servicios`);
      const data = await response.json();
     
      setServiciosDisponibles(data);
      
      // Solo limpiar si NO estamos editando
      if (!reservaEditar) {
        setServiciosSeleccionados([]);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setServiciosDisponibles([]);
    }
  };

  const cargarHorariosDisponibles = async () => {
    setCargandoHorarios(true);
    try {
      
      
      const serviciosQuery = serviciosSeleccionados.join(',');
      const url = `http://localhost:3000/disponibilidad?idBarbero=${idBarbero}&fecha=${fecha}&servicios=${serviciosQuery}`;      
      
      const response = await fetch(url);
      const data = await response.json();
      
     
      
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
        setMensaje(data.mensaje || 'No se pudieron cargar los horarios');
      }
    } catch (error) {
      console.error(' Error al cargar horarios:', error);
      setMensaje('Error al cargar horarios disponibles');
      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  // ============================================================================
  // ✅ FUNCIÓN CORREGIDA: Toggle de servicios
  // ============================================================================
  const toggleServicio = (idServicio) => {
    setServiciosSeleccionados(prev => {
      if (prev.includes(idServicio)) {
        // Si ya está seleccionado, quitarlo
        return prev.filter(id => id !== idServicio);
      } else {
        // Si no está seleccionado, agregarlo
        return [...prev, idServicio];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idCliente || !idBarbero || !fecha || !hora || serviciosSeleccionados.length === 0) {
      window.alert('Por favor completa todos los campos y selecciona al menos un servicio');
      return;
    }

    const fechaHoraCompleta = `${fecha} ${hora}:00`;

    const reservaData = {
      idCliente: parseInt(idCliente),
      idBarbero: parseInt(idBarbero),
      fecha: fechaHoraCompleta,
      detalle: detalle || 'Sin comentarios',
      servicios: serviciosSeleccionados  // Array de idServicio
    };

    

    try {
      const url = reservaEditar 
        ? `http://localhost:3000/reservas/${reservaEditar.idReserva}`
        : 'http://localhost:3000/reservas';
      
      const method = reservaEditar ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      });

      const result = await response.json();

      if (response.ok) {
        if (reservaEditar) {
          window.alert('✅ Reserva actualizada exitosamente');
        } else {
          window.alert('✅ Reserva creada exitosamente');
        }

        limpiarFormulario();
        if (onReservaCreada) onReservaCreada();
        if (onCancelarEdicion) onCancelarEdicion();
      } else {
        // Mostrar error detallado
        console.error("❌ Error del servidor:", result);
        window.alert('❌ Error: ' + (result.error || result.mensaje || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      window.alert('❌ Error al procesar la reserva');
    }
  };

  const limpiarFormulario = () => {
    setIdCliente('');
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
          backgroundColor: mensaje.includes('Error') || mensaje.includes('❌') ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Seleccionar Cliente */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Cliente: *
          </label>
          <select 
            value={idCliente} 
            onChange={(e) => setIdCliente(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            required
          >
            <option value="">-- Selecciona un cliente --</option>
            {clientes.map(cliente => (
              <option key={cliente.idCliente} value={cliente.idCliente}>
                {cliente.nombre} - {cliente.telefono}
              </option>
            ))}
          </select>
        </div>

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
            disabled={!!reservaEditar}
          >
            <option value="">-- Selecciona un barbero --</option>
            {barberos.map(barbero => (
              <option key={barbero.idBarbero} value={barbero.idBarbero}>
                {barbero.nombreBarbero || barbero.nombre}
              </option>
            ))}
          </select>
          {reservaEditar && (
            <small style={{ color: '#666', fontSize: '12px' }}>
              ℹ️ No puedes cambiar el barbero al editar. Para cambiar barbero, cancela y crea una nueva reserva.
            </small>
          )}
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
                      disabled={!!reservaEditar}
                    />
                    <span>
                      <strong>{servicio.nombreServicio}</strong> - 
                      ${servicio.costo} - {servicio.duracion} min
                      {servicio.puntuacion && ` - ⭐ ${servicio.puntuacion}`}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            {reservaEditar && (
              <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                ℹ️ No puedes cambiar los servicios al editar. Para cambiar servicios, cancela y crea una nueva reserva.
              </small>
            )}
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
            style={{ width: '98%', padding: '8px', fontSize: '14px' }}
            required
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
          >
            {reservaEditar ? 'Actualizar Reserva' : 'Crear Reserva'}
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
                fontSize: '16px'}}>
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