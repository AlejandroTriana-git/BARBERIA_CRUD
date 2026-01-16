import pool from "../config/db.js";
import crypto from "crypto";


//Para validar si es numero de telefono o correo electronico
const normalizePhone = (value) =>
  value.replace(/[^\d+]/g, '');


const isPhone = (value) => {
  const phone = normalizePhone(value);
  return /^\+?\d{7,15}$/.test(phone);
};

const isEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

//Hasta aca es para validar, luego de esto son generadores de tokens

function generateTokenHex(lenBytes = 16) {
  return crypto.randomBytes(lenBytes).toString("hex"); // 16 bytes -> 32 hex chars
};

function hashToken(token, secret) {
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
};

export const obtenerUsuarios = async (req, res) => {
  try{
    const [rows] = await pool.query("SELECT idCliente, nombre, correo, telefono FROM cliente WHERE activo = 1");
    res.status(200).json(rows);
  } catch (error){
    res.status(500).json({error: "Error al obtener usuariossssss"});
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
    console.error("Error en crearUsuario:", error); // 👈 Agregar esto
    res.status(500).json({error: "Error al crear usuario"})

  }
  
};

//Esta funcion es la encargada de crear el hash y enviarlo a la DB( los requisitos son que el correo o telefono enviado existan)
export const crearHashToken = async (req, res) => {
  try {
    console.log("📨 Petición recibida:", req.body); // 👈 Ver qué llega
    
    const { identificador } = req.body;
    
    if (!identificador) {
      console.log("❌ Error: No se envió correo ni teléfono");
      return res.status(400).json({ error: "Debe diligenciar correo o telefono" });
    }
    
    let correo = null;
    let telefono = null;

    if (isEmail(identificador)) {
      correo = identificador.toLowerCase();
      console.log("Entro aca");
    } else if (isPhone(identificador)) {
      telefono = normalizePhone(identificador);
    } else {
      return res.status(400).json({ error: "Formato de correo o teléfono inválido" });
    }

    console.log("🔍 Buscando usuario");
    
    const [existe] = await pool.query(
      "SELECT idCliente FROM cliente WHERE correo = ? OR telefono = ? LIMIT 1",
      [correo, telefono]
    );


    console.log("🔎 Resultado de búsqueda:", existe); // 👈 Ver si encontró algo

    if (existe.length > 0) {
      console.log("✅ Usuario encontrado, generando token...");
      
      const idCliente = existe[0].idCliente;
      const canal = correo ? "email" : "sms";
      const MAX_TOKENS_PER_HOUR = 5;

      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total
        FROM verificacionTokens
        WHERE idCliente = ?
          AND creacion >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [idCliente]
      );

      if (countRows[0].total >= MAX_TOKENS_PER_HOUR) {
        // Respuesta genérica para no revelar información, aca alcanzo el rate limit
        console.log("⚠️ Rate limit alcanzado (tokens por hora)");
        return res.status(200).json("Si el correo/teléfono existe, recibirás un código de verificación");
      }

      // Rate limit simple: no permitir reenvío si hay token no usado creado en los últimos X segundos
      const MIN_SECS_BETWEEN = 180; // ejemplo: 180s
      const [lastRows] = await pool.query(
        `SELECT expira, creacion FROM verificacionTokens 
        WHERE idCliente = ? AND canal = ? AND usado = 0
        ORDER BY creacion DESC LIMIT 1`,
        [idCliente, canal]
      );
      if (lastRows.length > 0 && new Date(lastRows[0].expira) > new Date()) {
        const secondsSinceCreated =
          (Date.now() - new Date(lastRows[0].creado)) / 1000;

        if (secondsSinceCreated < MIN_SECS_BETWEEN) {
          return res.status(200).json("Si el correo/teléfono existe, recibirás un código de verificación");
        }
      }


      //Ahora si, luego de verificar si ya habia hecho envios antes, y el mas reciente halla o no expirado, se verifica si han pasado mas de los 180seg
      // si no es asi, se envia mensaje distractor.
      // Generar el token aca

      const token = generateTokenHex(4);
      const tokenHash = hashToken(token, process.env.TOKEN_SECRET);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      console.log("🔑 Token generado:", token);
      console.log("🔐 Token hash:", tokenHash);
      console.log("⏰ Expira en:", expiresAt);



      
    // Transacción: marcar anteriores como usados (o expirados) y crear nuevo token
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        // invalidar anteriores no-usados para este usuario+canal
        await connection.query(
          `UPDATE verificacionTokens 
          SET usado = 1 
          WHERE idCliente = ? AND canal = ? AND usado = 0`,
          [idCliente, canal]
        );

        // insertar el nuevo token
        await connection.query(
          `INSERT INTO verificacionTokens (idCliente, tokenHash, expira, canal) 
          VALUES (?, ?, ?, ?)`,
          [idCliente, tokenHash, expiresAt, canal]
        );

        await connection.commit();
        console.log("✅ Token guardado en BD");
        
      } catch (txErr) {
          await connection.rollback();
          console.error("💥 Error en transacción:", txErr);
          throw txErr;
      } finally {
          connection.release();
      }

      // En dev puedes loggear, en prod NO
      if (process.env.NODE_ENV !== "production") {
        console.log(`Token for ${correo || telefono}: ${token}`);
      } else {
        // aquí enviar correo/SMS real
        // sendEmail(...) etc
      }

      return res.status(200).json("Si el correo/teléfono existe, recibirás un código de verificación");
      
    }else{
      return res.status(200).json("Si el correo/teléfono existe, recibirás un código de verificación");
    }
      
  }catch (error) {
    console.error("💥 ERROR en crearHashToken:", error); // 👈 Ver el error completo
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Error al crear tokens" });
  }
  };



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
      return res.status(400).json({ error: "Código inválido o expirado" }); // Mismo mensaje para evitar ataques
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