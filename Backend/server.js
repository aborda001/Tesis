const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");
const fs = require("fs");

const docenteRoutes = require("./routes/docenteRoutes");
const alumnoRoutes = require("./routes/alumnoRoutes");
const actividadRoutes = require("./routes/actividadRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Configurar multer para manejar archivos de audio
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => res.send("API Sistema Educativo"));

// Endpoint para análisis de emociones
app.post("/api/analyze-emotion", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió archivo de audio" });
    }

    const emotion = req.body.emotion || "happy";
    const audioPath = req.file.path;

    // Crear FormData para enviar al servicio Python
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(audioPath));
    formData.append("emotion", emotion);

    // Llamar al servicio Python
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";
    const response = await fetch(`${PYTHON_SERVICE_URL}/analyze-emotion`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    // Limpiar archivo temporal
    fs.unlinkSync(audioPath);

    if (!response.ok) {
      throw new Error("Error en el servicio de análisis de emociones");
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Error procesando audio:", error);
    res.status(500).json({ error: error.message });
  }
});

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
