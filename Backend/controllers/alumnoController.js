const Alumno = require("../models/Alumno");

exports.create = async (req, res) => {
  try {
    const alumno = new Alumno({
      fullname: req.body.fullname,
      username: req.body.username,
      docente: req.body.docenteId,
      age: req.body.age,
      grade: req.body.grade,
    });
    await alumno.save();
    res.status(201).json(alumno);
  } catch (err) {
    res.status(500).json({ message: "Error al crear alumno" });
    console.error(err);
  }
};

exports.getAll = async (req, res) => {
  const alumnos = await Alumno.find({ docente: req.docenteId });
  res.json(alumnos);
};

exports.getByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const alumno = await Alumno.findOne({ username });
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }
    res.json(alumno);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener alumno" });
  }
};
