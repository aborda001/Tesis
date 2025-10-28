const { Schema, model } = require("mongoose");
const AlumnoSchema = new Schema(
  {
    fullname: { type: String, required: true },
    username: { type: String, required: true },
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true },
    age: { type: Number, required: true },
    grade: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = model("Alumno", AlumnoSchema);
