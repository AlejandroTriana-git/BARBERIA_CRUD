import pool from "../config/db.js";
import bcrypt from "bcrypt";


//Seccion para obtener a los usuarios y crear a los usuarios.
export const obtenerUsuarios = async (req, res) => {
  try{
    const [rows] = await pool.query(
      `SELECT
        u.idUsuario,
        r.nombreRol,
        CASE
          WHEN r.nombreRol = 'cliente' THEN c.nombreCliente
          WHEN r.nombreRol = 'barbero' THEN b.nombreBarbero
        END AS nombre,
        u.correoUsuario
        FROM usuario u
        JOIN rol r ON u.idRol = r.idRol
        LEFT JOIN cliente c ON c.idUsuario = u.idUsuario
        LEFT JOIN barbero b ON b.idUsuario = u.idUsuario`;);
    res.status(200).json(rows);
  } catch (error){
    res.status(500).json({error: "Error al obtener usuarios"});
  }
  
};



export const actualizarContraseña = async (req, res) => {
  try {

    const idUsuario = req.usuario.idUsuario;
    const { contraseñaAntigua, contraseñaNueva } = req.body;

    const [usuario] = await pool.query(
      "SELECT contraseñaUsuario FROM usuario WHERE idUsuario = ?",
      [idUsuario]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const contraseñaHash = usuario[0].contraseñaUsuario;

    const contraseñaValida = await bcrypt.compare(
      contraseñaAntigua,
      contraseñaHash
    );

    if (!contraseñaValida) {
      return res.status(400).json({
        mensaje: "La contraseña actual es incorrecta"
      });
    }

    const nuevaContraseñaHash = await bcrypt.hash(contraseñaNueva, 10);

    await pool.query(
      "UPDATE usuario SET contraseñaUsuario = ? WHERE idUsuario = ?",
      [nuevaContraseñaHash, idUsuario]
    );

    res.json({
      mensaje: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar:", error.message);
    res.status(500).json({ error: "Error al actualizar contraseña" });
  }
};




export const actualizarCorreo = async (req, res) => {
  try {

    const idUsuario = req.usuario.idUsuario;
    const { correoNuevo, contraseña } = req.body;

    // 1 verificar usuario
    const [usuario] = await pool.query(
      "SELECT contraseñaUsuario FROM usuario WHERE idUsuario = ?",
      [idUsuario]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const contraseñaHash = usuario[0].contraseñaUsuario;

    // 2 validar contraseña
    const contraseñaValida = await bcrypt.compare(
      contraseña,
      contraseñaHash
    );

    if (!contraseñaValida) {
      return res.status(400).json({
        mensaje: "Contraseña incorrecta"
      });
    }

    // 3 verificar si el correo ya existe
    const [correoExiste] = await pool.query(
      "SELECT idUsuario FROM usuario WHERE correoUsuario = ?",
      [correoNuevo]
    );

    if (correoExiste.length > 0) {
      return res.status(400).json({
        mensaje: "El correo ya está registrado"
      });
    }

    // 4 actualizar correo
    await pool.query(
      "UPDATE usuario SET correoUsuario = ? WHERE idUsuario = ?",
      [correoNuevo, idUsuario]
    );

    res.json({
      mensaje: "Correo actualizado correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar:", error.message);
    res.status(500).json({ error: "Error al actualizar correo" });
  }
};


