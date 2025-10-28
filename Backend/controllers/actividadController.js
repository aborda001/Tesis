const Actividad = require("../models/Actividad");
const Alumno = require("../models/Alumno");

exports.create = async (req, res) => {
  try {
    const { alumnoId, actividad, descripcion, puntaje } = req.body;
    const alumno = await Alumno.findOne({
      _id: alumnoId,
    });
    if (!alumno)
      return res.status(404).json({ message: "Alumno no encontrado" });
    const act = new Actividad({
      alumno: alumno._id,
      actividad,
      descripcion,
      puntaje,
    });
    await act.save();
    res.status(201).json(act);
  } catch (err) {
    res.status(500).json({ message: "Error al crear actividad" });
  }
};

exports.getAll = async (req, res) => {
  const acts = await Actividad.find({ alumno: req.query.alumnoId });
  res.json(acts);
};
