import pool from "../config/db.js";
import { validarFecha } from "../utils/validaciones.js"; 

/**
 * ============================================================================
 * FUNCIÓN PRINCIPAL: Obtener horarios disponibles para reservar
 * ============================================================================
 * Esta función es la que consume el FRONTEND para mostrar los horarios
 * disponibles en el calendario/selector de horas
 */

//PERMISO:CLIENTE
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { idBarbero, fecha, servicios } = req.query;
    if (!idBarbero || !fecha || !servicios) {
      return res.status(400).json({ 
        error: "Faltan parámetros: idBarbero, fecha, servicios" 
      });
    }

    // Validar formato de fecha
    if (validarFecha(fecha).valido===false) {
      return res.status(400).json({
        error: validarFecha(fecha).error
      });
    }

    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaObj1 = new Date(fecha);
    fechaObj1.setHours(0,0,0,0);

    if (fechaObj1 < hoy) {
      return res.status(400).json({
        error: "Fecha inválida, no puede ser del pasado"
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
      `SELECT r.fechaReserva, SUM(s.duracion) AS duracionReserva
       FROM reserva r
       INNER JOIN reserva_servicio rs ON r.idReserva = rs.idReserva
       INNER JOIN servicio s ON rs.idServicio = s.idServicio
       WHERE r.idBarbero = ? AND DATE(r.fechaReserva) = ? AND r.estadoReserva = 1
       GROUP BY r.idReserva, r.fechaReserva
       ORDER BY r.fechaReserva`,
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
          horaInicioStr,
          horaFinStr
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
    // Validar parámetros iniciales
    if (!idBarbero || !fechaHora || !Array.isArray(servicios) || servicios.length === 0) {
      return { disponible: false, error: "Parámetros inválidos" };
    }

    // Validar formato de fechaHora (YYYY-MM-DD HH:mm:ss o similar)
    const fechaHoraRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/;
    if (!fechaHoraRegex.test(fechaHora)) {
      return { disponible: false, error: "Formato de fecha/hora inválido (esperado: YYYY-MM-DD HH:mm:ss)" };
    }

    // Convertir servicios a números si llegan como strings [1,2,3] o ["1","2","3"]
    const listaServicios = servicios.map(s => Number(s));

    // Verificar idBarbero
    const [barbero] = await pool.query(
      `SELECT idBarbero FROM barbero WHERE idBarbero = ?`,
      [idBarbero]
    );

    if (barbero.length === 0) {
      return { disponible: false, error: "Barbero no encontrado" };
    }

    // ========================================================================
    // PASO 1: Calcular duración total de todos los servicios
    // ========================================================================
    let duracionTotal = 0;

    for (const idServicio of listaServicios) {
      const [sumRows] = await pool.query(
        `SELECT duracion FROM servicio WHERE idServicio = ?`,
        [idServicio]
      );

      if (sumRows.length === 0) {
        return { disponible: false, duracionTotal: 0, mensaje: "Servicio no encontrado", idServicio };
      }
      duracionTotal += sumRows[0].duracion;
    }

    if (duracionTotal === 0) {
      return { disponible: false, duracionTotal: 0, mensaje: "Servicios no válidos" };
    }

    // ========================================================================
    // PASO 2: Validar que el barbero ofrece TODOS los servicios
    // ========================================================================
    for (const idServicio of listaServicios) {
      const [cntRow] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM barbero_servicio
         WHERE idBarbero = ? AND idServicio = ?`,
        [idBarbero, idServicio]
      );

      if (cntRow[0].cnt === 0) {
        return {
          disponible: false,
          duracionTotal,
          mensaje: "El barbero no ofrece todos los servicios seleccionados"
        };
      }
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
    let horaInicioTrabajo = null;
    if (ex.length > 0) {
      // HAY EXCEPCIÓN
      if (!ex[0].activo) {
        return { 
          disponible: false, 
          duracionTotal, 
          mensaje: "Barbero inactivo en esa fecha (día de descanso)" 
        };
      }
      horaInicioTrabajo = ex[0].horaInicio;
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
      horaInicioTrabajo = wk[0].horaInicio;
      horaFinTrabajo = wk[0].horaFin;
    }

    // ========================================================================
    // PASO 4: Obtener reservas existentes (excluyendo la actual si es edición)
    // ========================================================================
    let params = [idBarbero, fechaOnly];
    let query = `
      SELECT r.fechaReserva, SUM(s.duracion) AS duracionReserva
      FROM reserva r
      INNER JOIN reserva_servicio rs ON r.idReserva = rs.idReserva
      INNER JOIN servicio s ON rs.idServicio = s.idServicio
      WHERE r.idBarbero = ? AND DATE(r.fechaReserva) = ? AND r.estadoReserva = 1
    `;
    
    if (idReservaExcluir) {
      query += ` AND r.idReserva != ?`;
      params.push(idReservaExcluir);
    }
    
    query += ` GROUP BY r.idReserva, r.fechaReserva ORDER BY r.fechaReserva`;
    const [reservasExistentes] = await pool.query(query, params);

    // ========================================================================
    // PASO 5: Verificar disponibilidad
    // ========================================================================
    const disponible = verificarDisponibilidad(
      fechaHora,
      duracionTotal,
      reservasExistentes,
      horaInicioTrabajo,
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
 * FUNCIÓN AUXILIAR: Verificar si un horario está disponible
 * ============================================================================
 * Esta función se llama para CADA slot de 30 minutos y verifica:
 * 1. Que el servicio termine antes del cierre
 * 2. Que no colisione con otras reservas
 */

function verificarDisponibilidad(
  fechaHora,
  duracion,
  reservasExistentes,
  horaInicioTrabajo,
  horaFinTrabajo
) {

  const inicioNuevo = new Date(fechaHora);
  const finNuevo = new Date(inicioNuevo.getTime() + duracion * 60000);

  const fechaBase = fechaHora.split(" ")[0];

  const horarioInicio = new Date(`${fechaBase} ${horaInicioTrabajo}`);
  const horarioFin = new Date(`${fechaBase} ${horaFinTrabajo}`);

  // ============================================
  // VALIDACIÓN 1: Debe iniciar dentro del horario
  // ============================================
  if (inicioNuevo < horarioInicio || inicioNuevo >= horarioFin) {
    return false;
  }

  // ============================================
  // VALIDACIÓN 2: Debe terminar antes del cierre
  // ============================================
  if (finNuevo > horarioFin) {
    return false;
  }

  // ============================================
  // VALIDACIÓN 3: Debe respetar slots de 30 min
  // ============================================
  const minutos = inicioNuevo.getMinutes();

  if (minutos !== 0 && minutos !== 30) {
    return false;
  }

  // ============================================
  // VALIDACIÓN 4: No debe colisionar con reservas
  // ============================================
  for (const reserva of reservasExistentes) {

    const inicioReserva = new Date(reserva.fechaReserva);
    const finReserva = new Date(
      inicioReserva.getTime() + reserva.duracionReserva * 60000
    );

    const hayTraslape =
      (inicioNuevo >= inicioReserva && inicioNuevo < finReserva) ||
      (finNuevo > inicioReserva && finNuevo <= finReserva) ||
      (inicioNuevo <= inicioReserva && finNuevo >= finReserva);

    if (hayTraslape) {
      return false;
    }
  }

  return true;
}