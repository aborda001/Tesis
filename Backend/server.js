const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const docenteRoutes = require("./routes/docenteRoutes");
const alumnoRoutes = require("./routes/alumnoRoutes");
const actividadRoutes = require("./routes/actividadRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("API Sistema Educativo"));

// Rutas
app.use("/api/docentes", docenteRoutes);
app.use("/api/alumnos", alumnoRoutes);
app.use("/api/actividades", actividadRoutes);

// Conexión DB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sistema_educativo";
const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(PORT, () => console.log(`Server escuchando en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error("Error conectando a MongoDB", err);
    process.exit(1);
  });
