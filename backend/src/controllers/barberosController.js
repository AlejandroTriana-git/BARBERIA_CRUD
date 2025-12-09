import pool from "../config/db.js";

// Obtener todos los barberos
export const obtenerBarberos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM barbero");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener barberos:", error.message);
    res.status(500).json({ error: "Error al obtener barberos @" });
  }
};

// Obtener los servicios que ofrece un barbero específico
export const obtenerServiciosPorBarbero = async (req, res) => {
  try {
    const { idBarbero } = req.params;
    
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
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener servicios del barbero:", error.message);
    res.status(500).json({ error: "Error al obtener servicios del barbero" });
  }
};

// Obtener un barbero específico
export const obtenerBarberoPorId = async (req, res) => {
  try {
    const { idBarbero } = req.params;
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