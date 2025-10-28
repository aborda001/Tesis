const router = require("express").Router();
const auth = require("../middleware/auth");
const { create, getAll, getByUsername } = require("../controllers/alumnoController");
router.post("/", create);
router.get("/", auth, getAll);
router.get("/:username", getByUsername);
module.exports = router;
