// src/server.js (ESModules)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import usuariosRoutes from "./routes/usuarios.js";

import barberoRoutes from "./routes/barberos.js";
import servicioRoutes from "./routes/servicios.js";
import reservaRoutes from "./routes/reservas.js";
import disponibilidadRoutes from "./routes/disponibilidad.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

// Permitir solo tu front actual
app.use(cors({ origin: "http://localhost:3002" }));


//Dejas las APIS
app.use("/usuarios", usuariosRoutes);
app.use("/barberos", barberoRoutes);
app.use("/servicios", servicioRoutes);
app.use("/reservas", reservaRoutes);
app.use("/disponibilidad", disponibilidadRoutes);



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});





