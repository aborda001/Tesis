const { Schema, model } = require("mongoose");
const DocenteSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = model("Docente", DocenteSchema);
