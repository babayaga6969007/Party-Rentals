const express = require("express");
const router = express.Router();
const { getConfig, updateConfig } = require("../controllers/vinylConfigController");
const authAdmin = require("../middleware/authAdmin");

router.get("/", getConfig);
router.put("/admin", authAdmin, updateConfig);

module.exports = router;
