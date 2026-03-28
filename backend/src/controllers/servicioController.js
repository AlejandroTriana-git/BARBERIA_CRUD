import pool from "../config/db.js";



//PERMISO: ADMIN


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
    if (!idServicio) {
      return res.status(400).json({ message: "ID de servicio no proporcionado" });
    }
    
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


//Los siguientes dos los usa el admin para cuando necesite cambiar algo en la logica de servicios

export const crearServicio = async (req, res) => {
  try {

    const { nombreServicio, duracion, costo } = req.body;

    if (!nombreServicio || !duracion || !costo) {
      return res.status(400).json({
        message: "Nombre, duración y costo son obligatorios"
      });
    }

    if ((duracion < 0) || (costo < 0)){
      return res.status(400).json({message: "No se permiten valores negativos en esas casillas"});

    };

    const [result] = await pool.query(
      `INSERT INTO servicio 
      (nombreServicio, duracion, costo)
      VALUES (?, ?, ?)`,
      [nombreServicio, duracion, costo]
    );

    res.status(201).json({
      message: "Servicio creado correctamente",
      idServicio: result.insertId
    });

  } catch (error) {

    console.error("Error al crear servicio:", error.message);

    res.status(500).json({
      error: "Error al crear servicio"
    });

  }
};


export const actualizarServicio = async (req, res) => {
  try {

    const { idServicio } = req.params;

    const { nombreServicio, duracion, costo } = req.body;

    
    if ((duracion < 0) || (costo < 0)){
      return res.status(400).json({message: "No se permiten valores negativos en esas casillas"});

    };

    const [servicioExiste] = await pool.query(
      "SELECT idServicio FROM servicio WHERE idServicio = ?",
      [idServicio]
    );

    if (servicioExiste.length === 0) {
      return res.status(404).json({
        message: "Servicio no encontrado"
      });
    }

    await pool.query(
      `UPDATE servicio
       SET
       nombreServicio = COALESCE(?, nombreServicio),
       duracion = COALESCE(?, duracion),
       costo = COALESCE(?, costo)
       WHERE idServicio = ?`,
      [nombreServicio, duracion, costo, idServicio]
    );

    res.json({
      message: "Servicio actualizado correctamente"
    });

  } catch (error) {

    console.error("Error al actualizar servicio:", error.message);

    res.status(500).json({
      error: "Error al actualizar servicio"
    });

  }
};
