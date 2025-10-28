const router = require("express").Router();
const auth = require("../middleware/auth");
const { create, getAll } = require("../controllers/actividadController");
router.post("/", create);
router.get("/", getAll);
module.exports = router;
