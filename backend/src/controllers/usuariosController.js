import pool from "../config/db.js";
import crypto from "crypto";

function generateTokenHex(lenBytes = 16) {
  return crypto.randomBytes(lenBytes).toString("hex"); // 16 bytes -> 32 hex chars
}

function hashToken(token, secret) {
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export const obtenerUsuarios = async (req, res) => {
  try{
    const [rows] = await pool.query("SELECT idCliente, nnombre, correo, telefono FROM cliente WHERE activo = 1");
    res.status(200).json(rows);
  } catch (error){
    res.status(500).json({error: "Error al obtener usuarios"});
  }
  
};

//Esta funcion es la encargada de crear el hash y enviarlo a la DB( los requisitos son que el correo o telefono enviado existan)
export const crearHashToken = async (req, res) => {
  try{
    const {correo, telefono} = req.body;
    if (!correo && !telefono) {
      return res.status(400).json({error: "Debe diligenciar correo o telefono"});
    }
    const [existe] = await pool.query(
      "SELECT idCliente FROM cliente WHERE correo = ? OR telefono = ? ", [correo, telefono]
    );

    if (existe.length > 0){
      const userId = existe[0].idCliente;
      const token = generateTokenHex(16);
      const tokenHash = hashToken(token, process.env.TOKEN_SECRET);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      await pool.query(
        `INSERT INTO verificacionTokens (idCliente, tokenHash, expira, channel) VALUES (?, ?, ?, ?)`,
        [userId, tokenHash, expiresAt, correo ? "email" : "phone"]
      )
      // Por ahora el token para desarrollo
      // En producción esto NO se devuelve, se envía por correo/SMS
      console.log(`Token para ${correo || telefono}: ${token}`);
    }

    // SIEMPRE respondemos lo mismo, exista o no el usuario
    res.status(200).json({ 
      message: "Si el correo/teléfono existe, recibirás un código de verificación"
    });

  }catch(error){
    res.status(500).json({error: "Error al crear tokens"})

  }
  



}
export const verificarToken = async (req, res) => {
  try {
    const { token, correo, telefono } = req.body; // El usuario envía el código que recibió
    
    if (!token) {
      return res.status(400).json({ error: "Token requerido" });
    }
    
    if (!correo && !telefono) {
      return res.status(400).json({ error: "Debe proporcionar correo o telefono" });
    }

    // Primero obtenemos el idCliente
    const [cliente] = await pool.query(
      "SELECT idCliente FROM cliente WHERE correo = ? OR telefono = ?",
      [correo, telefono]
    );

    if (cliente.length === 0) {
      return res.status(400).json({ error: "Código inválido o expirado" }); // Mismo mensaje
    }


    const idCliente = cliente[0].idCliente;
    
    // Hasheamos el token que nos enviaron para compararlo
    const tokenHash = hashToken(token, process.env.TOKEN_SECRET);

    // Buscamos el token en la base de datos
    const [rows] = await pool.query(
      `SELECT idVerificacionTokens, usado FROM verificacionTokens 
       WHERE idCliente = ? AND tokenHash = ? AND usado = 0 AND expira > NOW()
       LIMIT 1`,
      [idCliente, tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    // Marcamos como usado
    await pool.query(
      `UPDATE verificacionTokens SET usado = 1 WHERE id = ?`,
      [rows[0].id]
    );

    res.status(200).json({ 
      message: "Token verificado exitosamente",
      idCliente 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar token" });
  }
};


export const crearUsuario = async (req, res) => {
  try{
    const { nombre, correo, telefono } = req.body;
    if (!nombre || !correo || !telefono) {
      return res.status(400).json({error : "Nombre, correo y telefono son obligatorios"});
    }

    const [existe] = await pool.query(
      "SELECT idCliente FROM cliente WHERE correo = ? OR telefono = ?", 
      [correo, 
      telefono]);
    
    if (existe.length > 0){
      return res.status(409).json({error: "Correo o telefono ya esta registrado"});
    }

    
    await pool.query("INSERT INTO cliente (nombre, correo, telefono) VALUES (?, ?, ?)", [
      nombre,
      correo,
      telefono,
      ]);
    res.status(201).json({ message: "Cliente creado:", nombre});
    
  }catch(error){
    res.status(500).json({error: "Error al crear usuario"})

  }
  
};

//Falta validadr ahora que no se repita
export const actualizarUsuario = async (req, res) => {
  try {
    const { idCliente } = req.params;
    const { nombre, correo, telefono } = req.body;

    const [result] = await pool.query(
      "UPDATE cliente SET nombre = ?, correo = ?, telefono = ? WHERE idCliente = ?",
      [nombre, correo, telefono, idCliente]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente actualizado", nombre });
  } catch (error) {
    console.error("Error al actualizar:", error.message);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};


export const eliminarUsuario = async (req, res) => {
  const { idCliente } = req.params;
  await pool.query("UPDATE cliente SET activo = 0 WHERE idCliente = ?", [idCliente]);
  res.json({ message: "Cliente eliminado" });
};


//Verificar todas las validaciones de errores.
//Asi mismo crear ruta que permita ingresar a la plataforma.