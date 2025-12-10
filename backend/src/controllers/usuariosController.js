import pool from "../config/db.js";

export const obtenerUsuarios = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM cliente WHERE activo = 1");
  res.json(rows);
};

export const crearUsuario = async (req, res) => {
  try{
    const { nombre, correo, telefono } = req.body;
    await pool.query("INSERT INTO cliente (nombre, correo, telefono) VALUES (?, ?, ?)", [
      nombre,
      correo,
      telefono,
    ]);
    res.json({ message: "Cliente creado:", nombre});

  }catch(error){
    res.status(500).json({error: "Error al crear usuario"})

  }
  
};


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