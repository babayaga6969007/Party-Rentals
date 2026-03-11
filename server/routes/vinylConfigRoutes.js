const express = require("express");
const router = express.Router();
const { getConfig, addSize, updateSize, removeSize } = require("../controllers/vinylConfigController");
const authAdmin = require("../middleware/authAdmin");

router.get("/", getConfig);
router.post("/admin/sizes", authAdmin, addSize);
router.put("/admin/sizes/:sizeId", authAdmin, updateSize);
router.delete("/admin/sizes/:sizeId", authAdmin, removeSize);

module.exports = router;
