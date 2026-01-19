import pool from "../config/db.js";
import crypto from "crypto";

//A futuro borrar las respuestas puestas en consola



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

    const [existe_correo] = await pool.query(
      "SELECT idCliente FROM cliente WHERE correo = ? ", 
      [correo]);

    const [existe_telefono] = await pool.query(
      "SELECT idCliente FROM cliente WHERE telefono = ? ", 
      [telefono]);
    
    if (existe_correo.length > 0){
      return res.status(409).json({error: "El correo ya esta registrado"});
    }else if(existe_telefono.length > 0){
      return res.status(409).json({error: "El numero de telefono ya esta registrado"});
    };

    
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
          (Date.now() - new Date(lastRows[0].creacion)) / 1000;
          console.log("Entra aca para verificar con 3 minutos");

        if (secondsSinceCreated < MIN_SECS_BETWEEN) {
          console.log("p2 Entra aca para verificar con 3 minutos");
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
  let connection = null;

  try {
    console.log("🔍 Verificando token...");

    const { token, identificador } = req.body;
    if (!token || !identificador) {
      return res.status(400).json({ error: "Datos requeridos" });
    }

    // Determinar correo o teléfono
    let correo = null;
    let telefono = null;
    if (isEmail(identificador)) {
      correo = identificador.toLowerCase();
    } else if (isPhone(identificador)) {
      telefono = normalizePhone(identificador);
    } else {
      return res.status(400).json({ error: "Formato inválido" });
    }

    const canal = correo ? "email" : "sms";

    // Obtener idCliente (no confirmar existencia pública)
    const [clienteRows] = await pool.query(
      "SELECT idCliente FROM cliente WHERE correo = ? OR telefono = ? LIMIT 1 FOR UPDATE",
      [correo, telefono]
    );

    if (clienteRows.length === 0) {
      // Mensaje genérico para evitar enumeración
      return res.status(400).json({ error: "Código inválido o expirado" });
    }
    const idCliente = clienteRows[0].idCliente;

    // Parámetros de seguridad
    const VENTANA_BLOQUEO_MINUTOS = 15;
    const MAX_INTENTOS = 5;
    const VENTANA_INTENTOS_MINUTOS = 15;

    // Obtener conexión dedicada porque se hacen transacciones
    connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1) desbloquear bloqueos vencidos
      await connection.query(
        `UPDATE intentosVerificacion 
         SET bloqueado = 0 
         WHERE idCliente = ? 
           AND bloqueado = 1 
           AND fecha < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
        [idCliente, VENTANA_BLOQUEO_MINUTOS]
      );

      // 2) verificar si hay bloqueo activo (calcular minutos restantes en SQL) - FOR UPDATE para evitar races
      const [bloqueoRows] = await connection.query(
        `SELECT idIntentosVerificacion,
                CEIL(GREATEST(TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(fecha, INTERVAL ? MINUTE)), 0)/60) AS minutosRestantes
         FROM intentosVerificacion
         WHERE idCliente = ? AND bloqueado = 1 AND fecha >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
         ORDER BY fecha DESC
         LIMIT 1
         FOR UPDATE`,
        [VENTANA_BLOQUEO_MINUTOS, idCliente, VENTANA_BLOQUEO_MINUTOS]
      );

      if (bloqueoRows.length > 0) {
        const tiempoRestante = bloqueoRows[0].minutosRestantes;
        await connection.rollback();
        console.log(`🚫 Cliente ${idCliente} está bloqueado`);
        return res.status(429).json({
          error: `Cuenta temporalmente bloqueada. Intenta en ${tiempoRestante} minuto(s).`
        });
      }

      // 3) contar intentos fallidos recientes (FOR UPDATE para consistencia)
      const [intentosRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM intentosVerificacion
         WHERE idCliente = ? AND exitoso = 0 AND fecha >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
         FOR UPDATE`,
        [idCliente, VENTANA_INTENTOS_MINUTOS]
      );

      const intentosFallidos = intentosRows[0].total;
      
      // 4) si excede límite → insertar bloqueo y hacer commit
      if (intentosFallidos >= MAX_INTENTOS) {
        await connection.query(
          `INSERT INTO intentosVerificacion (idCliente, exitoso, bloqueado, fecha)
           VALUES (?, 0, 1, NOW())`,
          [idCliente]
        );

        await connection.commit();
        console.log(`⚠️ Cliente ${idCliente} alcanzó límite de intentos - BLOQUEANDO`);
        return res.status(429).json({
          error: `Demasiados intentos fallidos. Cuenta bloqueada por ${VENTANA_BLOQUEO_MINUTOS} minutos.`
        });
      }

      // 5) validar token (seleccionar FOR UPDATE para bloquear la fila mientras la consumimos)
      const tokenHash = hashToken(token, process.env.TOKEN_SECRET);
      const [tokenRows] = await connection.query(
        `SELECT idVerificacionTokens, usado, expira
         FROM verificacionTokens
         WHERE idCliente = ? AND tokenHash = ? AND canal = ? AND usado = 0 AND expira > NOW()
         LIMIT 1
         FOR UPDATE`,
        [idCliente, tokenHash, canal]
      );

      if (tokenRows.length === 0) {
        // Registrar intento fallido
        await connection.query(
          `INSERT INTO intentosVerificacion (idCliente, exitoso, fecha)
           VALUES (?, 0, NOW())`,
          [idCliente]
        );

        // calcular intentos restantes (sin necesidad de nueva query: intentosFallidos + 1)
        const intentosActuales = intentosFallidos + 1;
        const intentosRestantes = Math.max(0, MAX_INTENTOS - intentosActuales);

        await connection.commit(); // commit cambios (registro del intento)
        console.log(`❌ Token inválido para cliente ${idCliente}`);
        if (intentosRestantes > 0) {
          return res.status(400).json({
            error: `Código inválido o expirado. Te quedan ${intentosRestantes} intento(s).`
          });
        } else {
          return res.status(400).json({ error: "Código inválido o expirado." });
        }
      }

      // 6) token válido → marcar usado e invalidar otros tokens del canal
      const tokenId = tokenRows[0].idVerificacionTokens;
      await connection.query(
        `UPDATE verificacionTokens SET usado = 1 WHERE idVerificacionTokens = ?`,
        [tokenId]
      );
      await connection.query(
        `UPDATE verificacionTokens
         SET usado = 1
         WHERE idCliente = ? AND canal = ? AND usado = 0 AND idVerificacionTokens != ?`,
        [idCliente, canal, tokenId]
      );

      // registrar intento exitoso
      await connection.query(
        `INSERT INTO intentosVerificacion (idCliente, exitoso, fecha)
         VALUES (?, 1, NOW())`,
        [idCliente]
      );

      // limpieza de intentos antiguos SOLO de este cliente (evitar borrar todo)
      await connection.query(
        `DELETE FROM intentosVerificacion
         WHERE idCliente = ? AND fecha < DATE_SUB(NOW(), INTERVAL 1 DAY)`,
        [idCliente]
      );

      await connection.commit();
      console.log(`✅ Verificación exitosa - Cliente ${idCliente}`);
    } catch (txErr) {
      if (connection) {
        try { await connection.rollback(); } catch (e) { console.error("Rollback falló:", e); }
      }
      throw txErr;
    } finally {
      if (connection) connection.release();
      connection = null;
    }

    // 7) Obtener datos de usuario y responder
    const [userData] = await pool.query(
      "SELECT idCliente, nombre, correo FROM cliente WHERE idCliente = ?",
      [idCliente]
    );

    return res.status(200).json({
      message: "Verificación exitosa",
      usuario: userData[0]
    });

  } catch (error) {
    console.error("💥 ERROR en verificarToken:", error);
    // asegúrate de no exponer errores internos al cliente
    return res.status(500).json({ error: "Error al verificar código" });
  } finally {
    // guard para liberar si algo falló antes del finally interno
    if (connection) {
      try { connection.release(); } catch (e) { /* no-op */ }
    }
  }
};



export const actualizarUsuario = async (req, res) => {
  try {
    const { idCliente } = req.params;
    const { nombre, correo, telefono } = req.body;


    const [existe_correo] = await pool.query(
      "SELECT idCliente FROM cliente WHERE correo = ? ", 
      [correo]);

    const [existe_telefono] = await pool.query(
      "SELECT idCliente FROM cliente WHERE telefono = ? ", 
      [telefono]);
    
    if (existe_correo.length > 0){
      return res.status(409).json({error: "Ese correo ya esta registrado en otro usuario"});
    }else if(existe_telefono.length > 0){
      return res.status(409).json({error: "Ese numero de telefono ya esta registrado en otro usuario"});
    };

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


export const desactivarUsuario = async (req, res) => {
  const { idCliente } = req.params;
  await pool.query("UPDATE cliente SET activo = 0 WHERE idCliente = ?", [idCliente]);
  res.json({ message: "Cliente eliminado" });
};



