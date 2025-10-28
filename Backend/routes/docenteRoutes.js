const router = require("express").Router();
const { register, login, getAll } = require("../controllers/docenteController");
router.get("/", getAll);
router.post("/", register);
router.post("/login", login);
module.exports = router;
