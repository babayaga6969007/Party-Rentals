const express = require("express");
const router = express.Router();
const {
  getConfig,
  updateConfig,
  addSize,
  updateSize,
  removeSize,
} = require("../controllers/vinylPrintingConfigController");
const authAdmin = require("../middleware/authAdmin");

router.get("/", getConfig);
router.get("/admin", authAdmin, getConfig);
router.put("/admin", authAdmin, updateConfig);
router.post("/admin/sizes", authAdmin, addSize);
router.put("/admin/sizes/:sizeId", authAdmin, updateSize);
router.delete("/admin/sizes/:sizeId", authAdmin, removeSize);

module.exports = router;
