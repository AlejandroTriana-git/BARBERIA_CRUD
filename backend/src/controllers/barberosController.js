import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { validarEmail,
          validarTelefono,
          validarNombre
} from "../utils/validaciones.js";
//Mejorar respuestas de horario_Barbero, mejorar logica con activo

// Obtener todos los barberos

//PERMISO: ADMIN y CLIENTE
export const obtenerBarberos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        idBarbero,
        nombreBarbero,
        telefonoBarbero
        FROM barbero`);

      if (rows.length === 0) {
        return res.status(404).json({
          message: "No hay barberos registrados"
        });
      }
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener barberos:", error.message);
    res.status(500).json({ error: "Error al obtener barberos @" });
  }
};

// Obtener los servicios que ofrece un barbero específico
//PERMISO: CLIENTES, ADMIN
export const obtenerServiciosPorBarbero = async (req, res) => {
  try {
    const { idBarbero } = req.params;
    if (!idBarbero) {
      return res.status(400).json({ error: "Falta idBarbero" });
    }
    const [barberoExiste] = await pool.query(
      "SELECT idBarbero FROM barbero WHERE idBarbero = ?",
      [idBarbero]
    );

    if (barberoExiste.length === 0) {
      return res.status(404).json({
        message: "Barbero no encontrado"
      });
    }
    // Consulta que une barbero_servicio con servicio
    const [rows] = await pool.query(
      `SELECT 
        s.idServicio,
        s.nombreServicio,
        s.duracion,
        s.costo,
        s.puntuacion
      FROM barbero_servicio bs
      INNER JOIN servicio s ON bs.idServicio = s.idServicio
      WHERE bs.idBarbero = ?`,
      [idBarbero]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        message: "Este barbero aún no tiene servicios asignados"
      });
    }
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener servicios del barbero:", error.message);
    res.status(500).json({ error: "Error al obtener servicios del barbero" });
  }
};

// Obtener un barbero específico
//PERMISO: NO USAR AUN, a futuro ver perfil del barbero, ver informacion del barbero
export const obtenerBarberoPorId = async (req, res) => {
  try {
    const { idBarbero } = req.params;

    if (!idBarbero) {
      return res.status(400).json({ error: "Falta idBarbero" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM barbero WHERE idBarbero = ?",
      [idBarbero]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener barbero:", error.message);
    res.status(500).json({ error: "Error al obtener barbero" });
  }
};

//PERMISO: ADMIN
export const crearBarbero = async (req, res) => {
  const connection = await pool.getConnection();

  try {

    const { nombreBarbero, telefonoBarbero, correoUsuario } = req.body;

    if (!nombreBarbero || !telefonoBarbero || !correoUsuario) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }
    // Validaciones

    if (validarNombre(nombreBarbero).valido === false) {
      return res.status(400).json({
        message: validarNombre(nombreBarbero).error
      });
    }
    if (validarTelefono(telefonoBarbero).valido === false) {
      return res.status(400).json({
        message: validarTelefono(telefonoBarbero).error
      });
    }
    if (validarEmail(correoUsuario).valido === false) {
      return res.status(400).json({
        message: validarEmail(correoUsuario).error
      });
    } 

    // verificar si el correo ya existe
    const [correoExiste] = await connection.query(
      "SELECT idUsuario FROM usuario WHERE correoUsuario = ?",
      [correoUsuario]
    );

    if (correoExiste.length > 0) {
      return res.status(400).json({
        message: "El correo ya está registrado"
      });
    }

    // contraseña temporal
    const contraseñaTemporal = Math.random().toString(36).slice(-8);

    const contraseñaHash = await bcrypt.hash(contraseñaTemporal, 10);

    await connection.beginTransaction();

    // crear usuario (rol barbero = 2 )
    const [usuarioResult] = await connection.query(
      `INSERT INTO usuario 
      (correoUsuario, contraseñaUsuario, idRol)
      VALUES (?, ?, ?)`,
      [correoUsuario, contraseñaHash, 2]
    );//Mas adelante poner que cambiar contraeña si es su primera vez, o simplemente con fechaModificacion==Null y rol

    const idUsuario = usuarioResult.insertId;

    // crear barbero
    await connection.query(
      `INSERT INTO barbero 
      (idUsuario, nombreBarbero, telefonoBarbero)
      VALUES (?, ?, ?)`,
      [idUsuario, nombreBarbero, telefonoBarbero]
    );

    await connection.commit();

    res.status(201).json({
      message: "Barbero creado correctamente",
      contraseñaTemporal
    });

  } catch (error) {

    await connection.rollback();

    console.error("Error al crear barbero:", error.message);

    res.status(500).json({
      error: "Error al crear barbero"
    });

  } finally {

    connection.release();

  }
};

//PERMISO:ADMIN
export const actualizarBarbero = async (req, res) => {
  try {

    const { idBarbero } = req.params;
    const { nombreBarbero, telefonoBarbero } = req.body;

    if (!idBarbero) {
      return res.status(400).json({
        message: "Falta idBarbero"
      });
    }
    if (!nombreBarbero && !telefonoBarbero) {
      return res.status(400).json({
        message: "Al menos un campo (nombreBarbero o telefonoBarbero) debe ser proporcionado para actualizar"
      });
    }
    
    if (validarNombre(nombreBarbero).valido === false) {
      return res.status(400).json({
        message: validarNombre(nombreBarbero).error
      });
    }
    if (validarTelefono(telefonoBarbero).valido === false) {
      return res.status(400).json({
        message: validarTelefono(telefonoBarbero).error
      });
    }
    const [barberoExiste] = await pool.query(
      "SELECT idBarbero FROM barbero WHERE idBarbero = ?",
      [idBarbero]
    );

    if (barberoExiste.length === 0) {
      return res.status(404).json({
        message: "Barbero no encontrado"
      });
    }

      
    await pool.query(
      `UPDATE barbero 
       SET nombreBarbero = COALESCE(?, nombreBarbero), telefonoBarbero = COALESCE(?, telefonoBarbero)
       WHERE idBarbero = ?`,
      [nombreBarbero, telefonoBarbero, idBarbero]
    );

    res.json({
      message: "Barbero actualizado correctamente"
    });

  } catch (error) {

    console.error("Error al actualizar barbero:", error.message);

    res.status(500).json({
      error: "Error al actualizar barbero"
    });

  }
};



// asignarServicioBarbero, aca manejo con un for, si el fronted llega a enviar muchos servicios

//PERMISO:ADMIN
export const asignarServiciosBarbero = async (req, res) => {
  const connection = await pool.getConnection();
  try {

    const { idBarbero, servicios } = req.body;

    if (!idBarbero || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({
        message: "Datos inválidos"
      });
    }

    // Validar que el barbero existe
    const [barberoExiste] = await connection.query(
      "SELECT idBarbero FROM barbero WHERE idBarbero = ?",
      [idBarbero]
    );

    if (barberoExiste.length === 0) {
      return res.status(404).json({
        message: "Barbero no encontrado"
      });
    }

    await connection.beginTransaction();

    for (const idServicio of servicios) {
      // Validar que el servicio existe
      const [servicioExiste] = await connection.query(
        "SELECT idServicio FROM servicio WHERE idServicio = ?",
        [idServicio]
      );

      if (servicioExiste.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          message: `Servicio con id ${idServicio} no encontrado`
        });
      }

      await connection.query(
        "INSERT INTO barbero_servicio (idBarbero, idServicio) VALUES (?, ?)",
        [idBarbero, idServicio]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Servicios asignados correctamente"
    });

  } catch (error) {

    await connection.rollback();

    console.error(error);

    res.status(500).json({
      error: "Error al asignar servicios"
    });

  } finally {

    connection.release();

  }
};



// eliminarServicioBarbero, tambien se maneja for, por si llega a enviar varios.
//PERMISO:ADMIN
export const eliminarServicioBarbero = async (req, res) => {
  const connection = await pool.getConnection();

  try {

    const { idBarbero, servicios } = req.body;

    if (!idBarbero || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({
        message: "Datos inválidos"
      });
    }

    // Validar que el barbero existe
    const [barberoExiste] = await connection.query(
      "SELECT idBarbero FROM barbero WHERE idBarbero = ?",
      [idBarbero]
    );

    if (barberoExiste.length === 0) {
      return res.status(404).json({
        message: "Barbero no encontrado"
      });
    }

    await connection.beginTransaction();

    for (const idServicio of servicios) {
      // Validar que el servicio existe
      const [servicioExiste] = await connection.query(
        "SELECT idServicio FROM servicio WHERE idServicio = ?",
        [idServicio]
      );
      if (servicioExiste.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          message: `Servicio con id ${idServicio} no encontrado`
        });
      }
      await connection.query(
        "DELETE FROM barbero_servicio WHERE idBarbero = ? AND idServicio = ?",
        [idBarbero, idServicio]
      );
    }

    await connection.commit();

    res.status(200).json({
      message: "Servicios eliminados correctamente"
    });

  } catch (error) {

    await connection.rollback();

    console.error(error);

    res.status(500).json({
      error: "Error al eliminar servicios"
    });

  } finally {

    connection.release();

  }
};
/**
 * ============================================================================
 * OBTENER horarios configurados de un barbero
 * ============================================================================
 */

//PERMISO:ADMIN
export const obtenerHorariosBarbero = async (req, res) => {
  try {
    const { idBarbero } = req.params;
    
    if (!idBarbero) {
      return res.status(400).json({ error: "Falta idBarbero" });
    }

    const [barberoExiste] = await pool.query(
      "SELECT idBarbero FROM barbero WHERE idBarbero = ?",
      [idBarbero]
    );

    if (barberoExiste.length === 0) {
      return res.status(404).json({
        message: "Barbero no encontrado"
      });
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
    
    if (horarios.length === 0){
      return res.status(404).json({
        message: "Horarios aun no asignados"
      });

    }
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

//PERMISO:ADMIN
export const gestionarHorarioBarbero = async (req, res) => {
  try {
    const { 
      idBarbero, 
      diaSemana = null, 
      fechaEspecifica = null, 
      horaInicio = null, 
      horaFin = null,
      activo =1
    } = req.body;
    
    // Validaciones
    
    if (!idBarbero) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos: idBarbero" 
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
    //Verifica para dias que no se trabaja, no se asignen horas
    if (activo == 0 && (horaInicio || horaFin)) {
      return res.status(400).json({
        error: "Si el horario está inactivo, horaInicio y horaFin deben ser null (dia que no se trabaja)"
      });
    }

    if (activo == 1) {
      if (!horaInicio || !horaFin) {
        return res.status(400).json({
          error: "Si el horario está activo, horaInicio y horaFin son obligatorios"
        });
      }
    }

    const [barberoExiste] = await pool.query(
      "SELECT idBarbero FROM barbero WHERE idBarbero = ?",
      [idBarbero]
    );

    
    if (barberoExiste.length === 0) {
      return res.status(404).json({
        message: "Barbero no encontrado"
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

//PERMISO:ADMIN
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
