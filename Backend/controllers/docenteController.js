const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Docente = require("../models/Docente");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "username y password requeridos" });
    const existing = await Docente.findOne({ username });
    if (existing) return res.status(400).json({ message: "Usuario ya existe" });
    const hash = await bcrypt.hash(password, 10);
    const docente = new Docente({ username, passwordHash: hash });
    await docente.save();
    res.status(201).json({ id: docente._id, username: docente.username });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const docente = await Docente.findOne({ username });
    if (!docente || !(await bcrypt.compare(password, docente.passwordHash))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const token = jwt.sign(
      { id: docente._id, username: docente.username },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const docentes = await Docente.find().select("-passwordHash");
    res.json(docentes);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};