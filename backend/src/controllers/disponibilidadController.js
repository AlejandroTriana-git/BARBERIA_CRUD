import pool from "../config/db.js";

/**
 * ============================================================================
 * FUNCIÓN PRINCIPAL: Obtener horarios disponibles para reservar
 * ============================================================================
 * Esta función es la que consume el FRONTEND para mostrar los horarios
 * disponibles en el calendario/selector de horas
 */
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { idBarbero, fecha, servicios } = req.query;
    
    if (!idBarbero || !fecha || !servicios) {
      return res.status(400).json({ 
        error: "Faltan parámetros: idBarbero, fecha, servicios" 
      });
    }

    // Convertir servicios de string a array de números
    const listaServicios = servicios.split(',').map(Number);
    
    // ========================================================================
    // PASO 1: Calcular duración total de los servicios seleccionados
    // ========================================================================
    const [serviciosInfo] = await pool.query(
      `SELECT SUM(s.duracion) AS duracionTotal
       FROM servicio s
       INNER JOIN barbero_servicio bs ON s.idServicio = bs.idServicio
       WHERE bs.idBarbero = ? AND s.idServicio IN (?)`,
      [idBarbero, listaServicios]
    );
    
    const duracionTotal = serviciosInfo[0]?.duracionTotal || 0;
    
    if (duracionTotal === 0) {
      return res.json({
        duracionTotal: 0,
        horariosDisponibles: [],
        mensaje: "Servicios no válidos o no ofrecidos por este barbero"
      });
    }
    
    // ========================================================================
    // PASO 2: Convertir fecha a día de la semana
    // ========================================================================
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObj.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    const diaConvertido = diaSemana === 0 ? 7 : diaSemana; // MySQL: 7=domingo
    
    // ========================================================================
    // PASO 3: Buscar PRIMERO si hay una EXCEPCIÓN para esa fecha específica
    // ========================================================================
    const [excepcion] = await pool.query(
      `SELECT horaInicio, horaFin, activo 
       FROM barbero_horario 
       WHERE idBarbero = ? AND fechaEspecifica = ?
       LIMIT 1`,
      [idBarbero, fecha]
    );
    
    let horaInicioStr, horaFinStr, esActivo;
    
    if (excepcion.length > 0) {
      // HAY UNA EXCEPCIÓN para esta fecha
      esActivo = excepcion[0].activo;
      horaInicioStr = excepcion[0].horaInicio;
      horaFinStr = excepcion[0].horaFin;
      
      // Si el barbero está inactivo ese día específico, no hay horarios
      if (!esActivo) {
        return res.json({
          duracionTotal,
          horariosDisponibles: [],
          mensaje: `El barbero no trabaja el ${fecha} (día de descanso)`
        });
      }
    } else {
      // NO HAY EXCEPCIÓN: usar horario semanal normal
      const [horarioSemanal] = await pool.query(
        `SELECT horaInicio, horaFin, activo 
         FROM barbero_horario 
         WHERE idBarbero = ? AND diaSemana = ? AND fechaEspecifica IS NULL
         LIMIT 1`,
        [idBarbero, diaConvertido]
      );
      
      if (horarioSemanal.length === 0) {
        return res.json({
          duracionTotal,
          horariosDisponibles: [],
          mensaje: `El barbero no trabaja los ${['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'][diaSemana]}`
        });
      }
      
      esActivo = horarioSemanal[0].activo;
      horaInicioStr = horarioSemanal[0].horaInicio;
      horaFinStr = horarioSemanal[0].horaFin;
      
      if (!esActivo) {
        return res.json({
          duracionTotal,
          horariosDisponibles: [],
          mensaje: `El barbero no trabaja los ${['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'][diaSemana]} (día inactivo)`
        });
      }
    }
    
    // ========================================================================
    // PASO 4: Convertir TIME a horas/minutos
    // ========================================================================
    const horaInicio = parseInt(horaInicioStr.split(':')[0]);
    const minutoInicio = parseInt(horaInicioStr.split(':')[1]);
    const horaFin = parseInt(horaFinStr.split(':')[0]);
    const minutoFin = parseInt(horaFinStr.split(':')[1]);
    
    // ========================================================================
    // PASO 5: Obtener todas las reservas existentes para ese día
    // ========================================================================
    const [reservasExistentes] = await pool.query(
      `SELECT r.fecha, SUM(s.duracion) AS duracionReserva
       FROM reserva r
       INNER JOIN reserva_servicio rs ON r.idReserva = rs.idReserva
       INNER JOIN servicio s ON rs.idServicio = s.idServicio
       WHERE r.idBarbero = ? AND DATE(r.fecha) = ? AND r.estado = 1
       GROUP BY r.idReserva, r.fecha
       ORDER BY r.fecha`,
      [idBarbero, fecha]
    );
    
    // ========================================================================
    // PASO 5.5: Obtener hora actual si es HOY
    // ========================================================================
    const ahora = new Date();
    const esHoy = fecha === ahora.toISOString().split('T')[0];
    let horaActual = ahora.getHours();
    let minutoActual = ahora.getMinutes();

    // Redondear al siguiente slot de 30 minutos
    if (esHoy) {
      // Si estamos en minuto 0-29, el próximo slot es :30 de esta hora
      // Si estamos en minuto 30-59, el próximo slot es :00 de la siguiente hora
      if (minutoActual < 30) {
        minutoActual = 30;
      } else {
        horaActual += 1;
        minutoActual = 0;
      }
    }

    // ========================================================================
    // PASO 6: Generar todos los horarios posibles en intervalos de 30 min
    // ========================================================================
    const horariosDisponibles = [];

    for (let hora = horaInicio; hora <= horaFin; hora++) {
      const minutosIniciales = (hora === horaInicio) ? minutoInicio : 0;
      const minutosFinal = (hora === horaFin) ? minutoFin : 60;
      
      for (let minuto = minutosIniciales; minuto < minutosFinal; minuto += 30) {
        // ====================================================================
        // FILTRO: Si es HOY, solo mostrar horarios futuros
        // ====================================================================
        if (esHoy) {
          if (hora < horaActual || (hora === horaActual && minuto < minutoActual)) {
            continue; // Saltar este slot porque ya pasó
          }
        }
        
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        const fechaHoraCompleta = `${fecha} ${horaFormateada}:00`;
        
        // Verificar si este slot está disponible
        const estaDisponible = verificarDisponibilidad(
          fechaHoraCompleta, 
          duracionTotal, 
          reservasExistentes,
          `${horaFin.toString().padStart(2, '0')}:${minutoFin.toString().padStart(2, '0')}:00`
        );
        
        if (estaDisponible) {
          horariosDisponibles.push(horaFormateada);
        }
      }
    }
    res.json({
      duracionTotal,
      horariosDisponibles,
      horarioTrabajo: {
        inicio: horaInicioStr,
        fin: horaFinStr,
        dia: diaSemana,
        esExcepcion: excepcion.length > 0
      }
    });
    
  } catch (error) {
    console.error("Error al obtener horarios:", error.message);
    res.status(500).json({ error: "Error al obtener horarios disponibles" });
  }
};


/**
 * ============================================================================
 * FUNCIÓN DE VALIDACIÓN: Usar antes de crear/actualizar reservas
 * ============================================================================
 * Esta función NO es para mostrar horarios, sino para VALIDAR una reserva
 * antes de crearla o actualizarla en la base de datos
 */
export const validarDisponibilidadReserva = async (idBarbero, fechaHora, servicios, idReservaExcluir = null) => {
  try {
    // Normalizar servicios a array
    const listaServicios = Array.isArray(servicios) 
      ? servicios.map(Number) 
      : String(servicios).split(',').map(Number).filter(Boolean);

    if (!idBarbero || !fechaHora || listaServicios.length === 0) {
      return { disponible: false, error: "Parámetros inválidos" };
    }

    // ========================================================================
    // PASO 1: Calcular duración total
    // ========================================================================
    const [[sumRow]] = await pool.query(
      `SELECT SUM(s.duracion) AS duracionTotal
       FROM servicio s
       WHERE s.idServicio IN (?)`,
      [listaServicios]
    );
    
    const duracionTotal = sumRow?.duracionTotal || 0;
    if (duracionTotal === 0) {
      return { disponible: false, duracionTotal: 0, mensaje: "Servicios no válidos" };
    }

    // ========================================================================
    // PASO 2: Validar que el barbero ofrece TODOS los servicios
    // ========================================================================
    const [[cntRow]] = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM barbero_servicio bs
       WHERE bs.idBarbero = ? AND bs.idServicio IN (?)`,
      [idBarbero, listaServicios]
    );
    
    if ((cntRow?.cnt || 0) !== listaServicios.length) {
      return { 
        disponible: false, 
        duracionTotal, 
        mensaje: "El barbero no ofrece todos los servicios seleccionados" 
      };
    }

    // ========================================================================
    // PASO 3: Obtener horario efectivo (excepción o semanal)
    // ========================================================================
    const fechaOnly = fechaHora.split(' ')[0];
    const fechaObj = new Date(`${fechaOnly}T00:00:00`);
    const weekday = fechaObj.getDay();
    const diaConvertido = weekday === 0 ? 7 : weekday;

    // Buscar PRIMERO si hay excepción
    const [ex] = await pool.query(
      `SELECT horaInicio, horaFin, activo 
       FROM barbero_horario 
       WHERE idBarbero = ? AND fechaEspecifica = ?
       LIMIT 1`,
      [idBarbero, fechaOnly]
    );

    let horaFinTrabajo = null;
    
    if (ex.length > 0) {
      // HAY EXCEPCIÓN
      if (!ex[0].activo) {
        return { 
          disponible: false, 
          duracionTotal, 
          mensaje: "Barbero inactivo en esa fecha (día de descanso)" 
        };
      }
      horaFinTrabajo = ex[0].horaFin;
    } else {
      // Usar horario semanal
      const [wk] = await pool.query(
        `SELECT horaInicio, horaFin, activo 
         FROM barbero_horario 
         WHERE idBarbero = ? AND diaSemana = ? AND fechaEspecifica IS NULL
         LIMIT 1`,
        [idBarbero, diaConvertido]
      );
      
      if (wk.length === 0) {
        return { 
          disponible: false, 
          duracionTotal, 
          mensaje: "Barbero no tiene horario configurado para ese día" 
        };
      }
      
      if (!wk[0].activo) {
        return { 
          disponible: false, 
          duracionTotal, 
          mensaje: "Barbero inactivo ese día de la semana" 
        };
      }
      
      horaFinTrabajo = wk[0].horaFin;
    }

    // ========================================================================
    // PASO 4: Obtener reservas existentes (excluyendo la actual si es edición)
    // ========================================================================
    let params = [idBarbero, fechaOnly];
    let query = `
      SELECT r.fecha, SUM(s.duracion) AS duracionReserva
      FROM reserva r
      INNER JOIN reserva_servicio rs ON r.idReserva = rs.idReserva
      INNER JOIN servicio s ON rs.idServicio = s.idServicio
      WHERE r.idBarbero = ? AND DATE(r.fecha) = ? AND r.estado = 1
    `;
    
    if (idReservaExcluir) {
      query += ` AND r.idReserva != ?`;
      params.push(idReservaExcluir);
    }
    
    query += ` GROUP BY r.idReserva, r.fecha ORDER BY r.fecha`;
    const [reservasExistentes] = await pool.query(query, params);

    // ========================================================================
    // PASO 5: Verificar disponibilidad
    // ========================================================================
    const disponible = verificarDisponibilidad(
      fechaHora, 
      duracionTotal, 
      reservasExistentes, 
      horaFinTrabajo
    );

    return { 
      disponible, 
      duracionTotal, 
      conflictos: disponible ? [] : reservasExistentes 
    };

  } catch (error) {
    console.error("Error al validar disponibilidad:", error);
    return { disponible: false, error: error.message };
  }
};

/**
 * ============================================================================
 * OBTENER horarios configurados de un barbero
 * ============================================================================
 */
export const obtenerHorariosBarbero = async (req, res) => {
  try {
    const { idBarbero } = req.params;
    
    if (!idBarbero) {
      return res.status(400).json({ error: "Falta idBarbero" });
    }

    // Obtener horarios ordenados: excepciones primero, luego semanales
    const [horarios] = await pool.query(
      `SELECT * 
       FROM barbero_horario 
       WHERE idBarbero = ? 
       ORDER BY 
         (fechaEspecifica IS NOT NULL) DESC,
         fechaEspecifica ASC,
         diaSemana ASC`,
      [idBarbero]
    );
    
    res.json(horarios);
  } catch (error) {
    console.error("Error al obtener horarios del barbero:", error.message);
    res.status(500).json({ error: "Error al obtener horarios" });
  }
};

/**
 * ============================================================================
 * CREAR o ACTUALIZAR horario de un barbero
 * ============================================================================
 */
export const gestionarHorarioBarbero = async (req, res) => {
  try {
    const { 
      idBarbero, 
      diaSemana = null, 
      fechaEspecifica = null, 
      horaInicio, 
      horaFin,
      activo = 1 
    } = req.body;
    
    // Validaciones
    if (!idBarbero || !horaInicio || !horaFin) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos: idBarbero, horaInicio, horaFin" 
      });
    }
    
    // No pueden estar ambos definidos
    if (fechaEspecifica && diaSemana) {
      return res.status(400).json({ 
        error: "No se puede configurar diaSemana y fechaEspecifica simultáneamente" 
      });
    }
    
    // Al menos uno debe estar definido
    if (!fechaEspecifica && !diaSemana) {
      return res.status(400).json({ 
        error: "Debe especificar diaSemana o fechaEspecifica" 
      });
    }

    // Insertar o actualizar
    await pool.query(
      `INSERT INTO barbero_horario 
         (idBarbero, diaSemana, fechaEspecifica, horaInicio, horaFin, activo) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         horaInicio = VALUES(horaInicio), 
         horaFin = VALUES(horaFin),
         activo = VALUES(activo)`,
      [idBarbero, diaSemana, fechaEspecifica, horaInicio, horaFin, activo]
    );
    
    res.json({ message: "Horario configurado exitosamente" });
  } catch (error) {
    console.error("Error al configurar horario:", error.message);
    res.status(500).json({ error: "Error al configurar horario" });
  }
};

/**
 * ============================================================================
 * ELIMINAR horario de un barbero
 * ============================================================================
 */
export const eliminarHorarioBarbero = async (req, res) => {
  try {
    const { idHorario } = req.params;
    
    if (!idHorario) {
      return res.status(400).json({ error: "Falta idHorario" });
    }
    
    const [result] = await pool.query(
      "DELETE FROM barbero_horario WHERE idBarbero_Horario = ?",
      [idHorario]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Horario no encontrado" });
    }
    
    res.json({ message: "Horario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar horario:", error.message);
    res.status(500).json({ error: "Error al eliminar horario" });
  }
};








/**
 * ============================================================================
 * FUNCIÓN AUXILIAR: Verificar si un horario está disponible
 * ============================================================================
 * Esta función se llama para CADA slot de 30 minutos y verifica:
 * 1. Que el servicio termine antes del cierre
 * 2. Que no colisione con otras reservas
 */
function verificarDisponibilidad(fechaHora, duracion, reservasExistentes, horaFinTrabajo) {
  const inicioNuevo = new Date(fechaHora);
  const finNuevo = new Date(inicioNuevo.getTime() + duracion * 60000);
  
  // ========================================================================
  // VALIDACIÓN 1: El servicio debe terminar ANTES del cierre
  // ========================================================================
  const [horaFin, minutoFin] = horaFinTrabajo.split(':').map(Number);
  const fechaBase = fechaHora.split(' ')[0];
  const horarioCierre = new Date(`${fechaBase} ${horaFin}:${minutoFin}:00`);
  
  if (finNuevo > horarioCierre) {
    return false; // El servicio se saldría del horario laboral
  }
  
  // ========================================================================
  // VALIDACIÓN 2: No debe haber traslape con otras reservas
  // ========================================================================
  for (const reserva of reservasExistentes) {
    const inicioReserva = new Date(reserva.fecha);
    const finReserva = new Date(inicioReserva.getTime() + reserva.duracionReserva * 60000);
    
    // Detectar cualquier tipo de traslape:
    // - La nueva empieza durante una existente
    // - La nueva termina durante una existente  
    // - La nueva envuelve completamente una existente
    const hayTraslape = (
      (inicioNuevo >= inicioReserva && inicioNuevo < finReserva) ||
      (finNuevo > inicioReserva && finNuevo <= finReserva) ||
      (inicioNuevo <= inicioReserva && finNuevo >= finReserva)
    );
    
    if (hayTraslape) {
      return false; // Hay conflicto con esta reserva
    }
  }
  
  return true; // Está libre
}