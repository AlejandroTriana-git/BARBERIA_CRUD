import pool from "../config/db.js";


//Obtener la info del cleinte
//PERMISO: CLIENTE
export const obtenerPerfilCliente = async (req, res) => {
  try {

    const { idUsuario } = req.usuario;
    const [rows] = await pool.query(
      `SELECT 
        c.nombreCliente,
        c.telefonoCliente,
        u.correoUsuario
      FROM cliente c
      INNER JOIN usuario u 
        ON c.idUsuario = u.idUsuario
      WHERE c.idUsuario = ?`,
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error("Error al obtener perfil cliente:", error.message);

    res.status(500).json({
      error: "Error al obtener perfil del cliente"
    });

  }
};

//Aca puede enviar a modificar tanto el nombre como telefono, o solo uno.
//PERMISO: CLIENTE
export const actualizarPerfilCliente = async (req, res) => {
  try {

    const { idUsuario } = req.usuario;
    const { nombreCliente, telefonoCliente } = req.body;

    // verificar que al menos un campo venga
    if (!nombreCliente && !telefonoCliente) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo para actualizar"
      });
    }

    // buscar cliente
    const [cliente] = await pool.query(
      "SELECT idCliente FROM cliente WHERE idUsuario = ?",
      [idUsuario]
    );

    if (cliente.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    const idCliente = cliente[0].idCliente;

    // actualizar (solo lo que venga, con COALESCE)
    await pool.query(
      `UPDATE cliente 
       SET 
       nombreCliente = COALESCE(?, nombreCliente),
       telefonoCliente = COALESCE(?, telefonoCliente)
       WHERE idCliente = ?`,
      [nombreCliente, telefonoCliente, idCliente]
    );

    res.json({
      message: "Perfil actualizado correctamente"
    });

  } catch (error) {

    console.error("Error al actualizar perfil:", error.message);

    res.status(500).json({
      error: "Error al actualizar perfil"
    });

  }
};