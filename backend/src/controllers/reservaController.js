import pool from "../config/db.js";
import { validarDisponibilidadReserva} from "./disponibilidadController.js"



export const obtenerReservas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        r.idReserva,
        r.idBarbero,
        r.fecha,
        r.detalle,
        r.estado,
        b.nombreBarbero as nombreBarbero,
        c.idCliente,
        c.nombre as nombreCliente,
        c.correo,
        c.telefono
      FROM reserva r 
      INNER JOIN cliente c ON r.idCliente = c.idCliente
      INNER JOIN barbero b ON r.idBarbero = b.idBarbero
      WHERE estado = 1
      ORDER BY r.fecha DESC`
    );
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener reservas:", error.message);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

/**
 * ============================================================================
 * OBTENER UNA RESERVA POR ID
 * ============================================================================
 */
export const obtenerReservaPorId = async (req, res) => {
  try {
    const { idReserva } = req.params;
    
    // Obtener datos básicos de la reserva
    const [[reserva]] = await pool.query(
      `SELECT 
        r.idReserva,
        r.idCliente,
        r.idBarbero,
        r.fecha,
        r.detalle,
        r.estado,
        b.nombreBarbero as nombreBarbero,
        c.nombre as nombreCliente,
        c.correo,
        c.telefono
      FROM reserva r
      INNER JOIN cliente c ON r.idCliente = c.idCliente
      INNER JOIN barbero b ON r.idBarbero = b.idBarbero
      WHERE r.idReserva = ?`,
      [idReserva]
    );
    
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    // Obtener servicios de la reserva
    const [servicios] = await pool.query(
      `SELECT 
        s.idServicio,
        s.nombreServicio,
        s.duracion,
        s.costo
      FROM reserva_servicio rs
      INNER JOIN servicio s ON rs.idServicio = s.idServicio
      WHERE rs.idReserva = ?`,
      [idReserva]
    );
    
    // Combinar información y agregar metadata de edición
    res.json({
      ...reserva,
      servicios,
      // Información para el frontend sobre qué se puede editar
      permisos: {
        editarFecha: true,
        editarHora: true,
        editarDetalles: true,
        editarServicios: false,  //  NO permitido
        editarBarbero: false     //  NO permitido
      },
      mensajes: {
        edicion: "Solo puedes cambiar la fecha/hora y los detalles de la reserva",
        servicios: "Para cambiar servicios o barbero, debes cancelar esta reserva y crear una nueva"
      }
    });
    
  } catch (error) {
    console.error("Error al obtener reserva:", error.message);
    res.status(500).json({ error: "Error al obtener reserva" });
  }
};

/**
 * ============================================================================
 * CREAR UNA NUEVA RESERVA (CON VALIDACIÓN DE DISPONIBILIDAD)
 * ============================================================================
 */
export const crearReserva = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { idCliente, idBarbero, fecha, detalle, servicios } = req.body;
    
    // ========================================================================
    // VALIDACIÓN 1: Datos requeridos
    // ========================================================================
    if (!idCliente || !idBarbero || !fecha || !servicios || servicios.length === 0) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos",
        requeridos: ["idCliente", "idBarbero", "fecha", "servicios (array)"]
      });
    }
    
    // ========================================================================
    // VALIDACIÓN 2: Verificar disponibilidad del horario
    // ========================================================================
    const validacion = await validarDisponibilidadReserva(
      idBarbero,
      fecha,
      servicios,
      null // No excluir ninguna reserva (es nueva)
    );
    
    if (!validacion.disponible) {
      return res.status(409).json({
        error: "El horario no está disponible",
        detalles: {
          mensaje: validacion.mensaje,
          duracionSolicitada: validacion.duracionTotal,
          conflictos: validacion.conflictos
        },
        sugerencia: "Elige otro horario o consulta los horarios disponibles"
      });
    }
    
    // ========================================================================
    // CREAR LA RESERVA
    // ========================================================================
    await connection.beginTransaction();
    
    // 1. Insertar la reserva
    const [resultReserva] = await connection.query(
      "INSERT INTO reserva (idCliente, idBarbero, fecha, detalle, estado) VALUES (?, ?, ?, ?, 1)",
      [idCliente, idBarbero, fecha, detalle || null]
    );
    
    const idReserva = resultReserva.insertId;
    
    // 2. Insertar los servicios en reserva_servicio
    for (const idServicio of servicios) {
      await connection.query(
        "INSERT INTO reserva_servicio (idReserva, idServicio) VALUES (?, ?)",
        [idReserva, idServicio]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      message: "Reserva creada exitosamente",
      reserva: {
        idReserva,
        idBarbero,
        fecha,
        duracion: validacion.duracionTotal,
        servicios
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear reserva:", error.message);
    res.status(500).json({ error: "Error al crear reserva" });
  } finally {
    connection.release();
  }
};



/* Actualizar una reserva
 */
export const actualizarReserva = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { idReserva } = req.params;
    const { fecha, detalle} = req.body;
    
    // Validar que la reserva existe
    const [reservaExistente] = await connection.query(
      "SELECT * FROM reserva WHERE idReserva = ?",
      [idReserva]
    );
    
    if (reservaExistente.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    // VALIDACIÓN FUTURA: Verificar que falten más de 24 horas
    const fechaReserva = new Date(reservaExistente[0].fecha);
    const ahora = new Date();
    const horasRestantes = (fechaReserva - ahora) / (1000 * 60 * 60);
    // 
    if (horasRestantes < 24) {
      return res.status(400).json({ 
        error: "No se puede modificar la reserva. Faltan menos de 24 horas." 
    });
    }
    
    await connection.beginTransaction();
    
    // 1. Actualizar datos básicos de la reserva
    await connection.query(
      "UPDATE reserva SET fecha = ?, detalle = ? WHERE idReserva = ?",
      [fecha || reservaExistente[0].fecha, detalle, idReserva]
    );
    

    
    await connection.commit();
    res.json({ message: "Reserva actualizada exitosamente" });
    
  } catch (error) {
    await connection.rollback();
    console.error("Error al actualizar reserva:", error.message);
    res.status(500).json({ error: "Error al actualizar reserva" });
  } finally {
    connection.release();
  }
};

// *===========================================================================
// *Cancelar una reserva, aunque realmente es colocarla en estado = 0 para tener el registro, mas adelnate incluir una tabla para reservasCanceladas 
// *============================================================================
export const cancelarReserva = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { idReserva } = req.params;

    // Iniciar la transacción
    await connection.beginTransaction();

    // 1. Buscar la reserva
    const [rows] = await connection.query(
      "SELECT * FROM reserva WHERE idReserva = ? FOR UPDATE",
      [idReserva]
    );

    const reserva = rows[0];

    if (!reserva) {
      await connection.rollback();
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    if (reserva.estado !== 1) {
      await connection.rollback();
      return res.status(400).json({
        error: "La reserva ya está cancelada o completada",
      });
    }

    // 2. Actualizar estado
    await connection.query(
      "UPDATE reserva SET estado = 0 WHERE idReserva = ?",
      [idReserva]
    );

    // 3. Insertar registro de cancelación en tabla secundaria
    await connection.query(
      "INSERT INTO cancelacionreserva (idReserva, fechaCancelacion) VALUES (?, ?)",
      [idReserva, new Date()]
    );

    // Confirmar cambios
    await connection.commit();

    res.json({ message: "Reserva cancelada exitosamente" });

  } catch (error) {
    await connection.rollback();
    console.error("Error al cancelar reserva:", error.message);
    res.status(500).json({ error: "Error al cancelar reserva" });
  } finally {
    connection.release();
  }
};



/**
 * ============================================================================
 * ELIMINAR RESERVA PERMANENTEMENTE (Solo para administrador)
 * ============================================================================
 * Solo debe ser accesible para administradores o para limpiar datos antiguos
 */
/* export const eliminarReservaPermanente = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { idReserva } = req.params;
    
    await connection.beginTransaction();
    
    // 1. Primero eliminar servicios (si no tienes CASCADE)
    await connection.query(
      "DELETE FROM reserva_servicio WHERE idReserva = ?",
      [idReserva]
    );
    
    // 2. Eliminar la reserva
    const [result] = await connection.query(
      "DELETE FROM reserva WHERE idReserva = ?",
      [idReserva]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    await connection.commit();
    
    res.json({ 
      message: "Reserva eliminada permanentemente de la base de datos",
      advertencia: "Esta acción no se puede deshacer"
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar reserva:", error.message);
    res.status(500).json({ error: "Error al eliminar reserva" });
  } finally {
    connection.release();
  }
}; */