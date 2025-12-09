import pool from "../config/db.js";

// Obtener todos los servicios
export const obtenerServicios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM servicio");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay servicios registrados" });
    }
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener servicios:", error.message);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};

// Obtener un servicio específico
export const obtenerServicioPorId = async (req, res) => {
  try {
    const { idServicio } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM servicio WHERE idServicio = ?",
      [idServicio]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener servicio:", error.message);
    res.status(500).json({ error: "Error al obtener servicio" });
  }
};