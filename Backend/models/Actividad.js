const { Schema, model } = require("mongoose");
const ActividadSchema = new Schema(
  {
    alumno: { type: Schema.Types.ObjectId, ref: "Alumno", required: true },
    actividad: { type: String, required: true },
    descripcion: { type: String },
    puntaje: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = model("Actividad", ActividadSchema);
