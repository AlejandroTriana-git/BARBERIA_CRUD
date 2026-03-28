import pool from "../config/db.js";
import { validarDisponibilidadReserva} from "./disponibilidadController.js";
import { validar24Horas} from "../utils/validaciones.js";

/* 

TENER EN CUENTA LOS SIGUIENTES ESTADOS:
0: cancelada
1:  Pendiente (en proximos dias tiene la reserva)
2:  No asistio
3:  Realizado
 */

//CLIENTES CON RESERVAS
//PERMISO: CLIENTE
//Para traer las reservas segun un filtro
export const obtenerReservas = async (req, res) => {
  try {
    const idCliente = req.usuario.idPerfil;
    
    if (!idCliente) {
      return res.status(400).json({ error: "ID de cliente no proporcionado" });
    }

    const { estado } = req.query;
    
    
    let filtroEstado = "";

   
    if (estado === "cancelada") {
      filtroEstado = "AND r.estadoReserva = 0";
    }

    if (estado === "realizadas") {
      filtroEstado = "AND r.estadoReserva = 3";
    }

    if (estado == "sin asistir"){
      filtroEstado = "AND r.estadoReserva = 2";
    }

    if (estado == "pendiente"){
      filtroEstado = "AND r.estadoReserva = 1";
    }
    const [rows] = await pool.query(
      `SELECT 
        r.idReserva,
        r.idBarbero,
        r.fechaReserva,
        r.detalleReserva,
        r.estadoReserva,
        b.nombreBarbero as nombreBarbero
      FROM reserva r 
      INNER JOIN barbero b ON r.idBarbero = b.idBarbero
      WHERE r.idCliente = ?
      ${filtroEstado}
      ORDER BY r.fechaReserva DESC`, 
      [idCliente]);
    
    
    if (rows.length === 0) {
      if (estado) {
        return res.json({ message: `No tienes reservas con estado ${estado}` });
      }else {

      res.json({ message: "No tienes reservas aun" });
    }}
    
    res.json(rows);
  } catch (error) {
    
    console.error("Error al obtener reserva:", error.message);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};


/**
 * ============================================================================
 * OBTENER UNA RESERVA POR ID
 * ============================================================================
 */
// PERMISO:  CLIENTE
export const obtenerReservaPorId = async (req, res) => {
  try {
    const { idReserva } = req.params;
    if (!idReserva) {
      return res.status(400).json({ error: "ID de reserva no proporcionado" });
    }
    // Obtener datos básicos de la reserva
    const [[reserva]] = await pool.query(
      `SELECT 
        r.idReserva,
        r.idCliente,
        r.idBarbero,
        r.fechaReserva,
        r.detalleReserva,
        r.estadoReserva,
        b.nombreBarbero as nombreBarbero,
        c.nombreCliente as nombreCliente,
        c.telefonoCliente
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
//PERMISO: CLIENTE


export const crearReserva = async (req, res) => {

  const connection = await pool.getConnection();

  try {

    const { idBarbero, fechaHora, servicios } = req.body;

    if (!idBarbero || !fechaHora || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos",
        requeridos: ["idCliente", "idBarbero", "fecha", "servicios (array)"]
      });
    }
    const fechaOnly = fechaHora.split(" ")[0];

    const fechaObj1 = new Date(fechaHora);

    if (isNaN(fechaObj1.getTime())) {
      return res.status(400).json({
        error: "Formato de fecha inválido"
      });
    }

    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    fechaObj1.setHours(0,0,0,0);

    if (fechaObj1 < hoy) {
      return res.status(400).json({
        error: "Fecha inválida, no puede ser del pasado"
      });
    }
    await connection.beginTransaction();

    // ========================================
    // BLOQUEAR RESERVAS DE ESE BARBERO
    // ========================================

    const [reservasBloqueadas] = await connection.query(`
      SELECT r.idReserva
      FROM reserva r
      WHERE r.idBarbero = ?
      AND DATE(r.fechaReserva) = ?
      FOR UPDATE
    `,[idBarbero, fechaOnly]);


    // ========================================
    // VALIDAR DISPONIBILIDAD
    // ========================================

    const validacion = await validarDisponibilidadReserva(
      idBarbero,
      fechaHora,
      servicios
    );

    if (!validacion.disponible) {

      await connection.rollback();

      return res.status(400).json({
        error: validacion.mensaje || "Horario no disponible"
      });

    }


    // ========================================
    // INSERTAR RESERVA
    // ========================================

    const [reserva] = await connection.query(`
      INSERT INTO reserva (
        idCliente,
        idBarbero,
        fechaReserva,
        estadoReserva
      )
      VALUES (?,?,?,1)
    `,[req.usuario.idPerfil,idBarbero,fechaHora]);


    const idReserva = reserva.insertId;


    // insertar servicios de la reserva

    for (const servicio of servicios) {

      await connection.query(`
        INSERT INTO reserva_servicio (idReserva,idServicio)
        VALUES (?,?)
      `,[idReserva, servicio]);

    }


    await connection.commit();

    res.json({
      ok:true,
      idReserva
    });

  } catch (error) {

    await connection.rollback();
    console.error(error);

    res.status(500).json({
      error:"Error creando reserva"
    });

  } finally {

    connection.release();

  }

};

/* Actualizar una reserva
 */
//PERMISO: CLIENTE
export const actualizarReserva = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { idReserva } = req.params;
    const { fecha, detalle} = req.body;
    
    if (!idReserva) {
      return res.status(400).json({ error: "ID de reserva no proporcionado" });
    }
    if (!fecha && !detalle) {
      return res.status(400).json({ error: "Faltan datos requeridos para actualizar" });
    }

    // Validar que la reserva existe
    const [reservaExistente] = await connection.query(
      "SELECT * FROM reserva WHERE idReserva = ?",
      [idReserva]
    );
    
    if (reservaExistente.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    // VALIDACIÓN FUTURA: Verificar que falten más de 24 horas
    const validacion24Horas = validar24Horas(reservaExistente[0].fechaReserva);
    if (validacion24Horas.valido === false) {
      return res.status(400).json({ 
        message: validacion24Horas.error
      });
    }
    
    await connection.beginTransaction();
    
    // 1. Actualizar datos básicos de la reserva
    await connection.query(
      "UPDATE reserva SET fechaReserva = ?, detalleReserva = ? WHERE idReserva = ?",
      [fecha || reservaExistente[0].fechaReserva, detalle, idReserva]
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
// *Cancelar una reserva, aunque realmente es colocarla en estado = 0 para tener el registro 
// *============================================================================

//PERMISO: CLIENTE
export const cancelarReserva = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { idReserva } = req.params;

    const {motivo} = req.body;
    // Validaciones básicas
    if (!idReserva) {
      return res.status(400).json({ error: "ID de reserva no proporcionado" });
    }
    if (!motivo) {
      return res.status(400).json({ error: "Motivo de cancelación es requerido" });
    }
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

    if (reserva.estadoReserva !== 1) {
      await connection.rollback();
      return res.status(400).json({
        error: "La reserva ya está cancelada o completada",
      });
    }
    // VALIDACIÓN FUTURA: Verificar que falten más de 24 horas
    if (validar24Horas(reserva.fechaReserva).valido === false) {
      await connection.rollback();
      return res.status(400).json({
        message: validar24Horas(reserva.fechaReserva).error
      });
    }

    // 2. Actualizar estado
    await connection.query(
      "UPDATE reserva SET estadoReserva = 0 WHERE idReserva = ?",
      [idReserva]
    );

    // 3. Insertar registro de cancelación en tabla secundaria
    await connection.query(
      "INSERT INTO cancelacionreserva (idReserva, fechaCancelacion, motivo) VALUES (?, ?, ?)",
      [idReserva, new Date(), motivo]
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

//PERMISO: BARBERO
export const agendaBarbero = async (req, res) => {
  try {

    const { idUsuario } = req.usuario;
    
    if (!idUsuario) {
      return res.status(400).json({
        message: "ID de usuario no proporcionado"
      });
    }
    const [barbero] = await pool.query(
      "SELECT idBarbero FROM barbero WHERE idUsuario = ?",
      [idUsuario]
    );

    if (barbero.length === 0) {
      return res.status(404).json({
        message: "Barbero no encontrado"
      });
    }

    const idBarbero = barbero[0].idBarbero;

 
    const [agenda] = await pool.query(
      `SELECT 
          r.idReserva,
          c.nombreCliente,
          r.fechaReserva,
          r.detalleReserva,
          GROUP_CONCAT(s.nombreServicio SEPARATOR ', ') AS servicios,
          SUM(s.duracion) AS duracionTotal,
          SUM(s.costo) AS costoTotal
      FROM reserva r
      JOIN reserva_servicio rs ON rs.idReserva = r.idReserva
      JOIN cliente c ON r.idCliente = c.idCliente
      JOIN servicio s ON rs.idServicio = s.idServicio
      WHERE r.idBarbero = ?
      GROUP BY r.idReserva
      ORDER BY r.fechaReserva`,
      [idBarbero]
    );
    if (agenda.length === 0) {
      return res.json({
        message: "No tienes reservas programadas"
      });
    }
    res.json(agenda);

  } catch (error) {

    console.error("Error al obtener agenda:", error.message);

    res.status(500).json({
      error: "Error al obtener agenda"
    });

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
