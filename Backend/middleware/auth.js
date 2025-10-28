const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No autorizado" });
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token)
    return res.status(401).json({ message: "Token inválido" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.docenteId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
};
