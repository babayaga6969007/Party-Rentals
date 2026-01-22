const express = require("express");
const router = express.Router();
const {
  getConfig,
  updateConfig,
  addFont,
  removeFont,
  addSize,
  updateSize,
  removeSize,
  updatePrice,
  updateCanvas,
} = require("../controllers/signageConfigController");
const authAdmin = require("../middleware/authAdmin");

// Public route to get config (for frontend)
router.get("/", getConfig);

// Admin routes
router.get("/admin", authAdmin, getConfig);
router.put("/admin", authAdmin, updateConfig);
router.post("/admin/fonts", authAdmin, addFont);
router.delete("/admin/fonts/:fontId", authAdmin, removeFont);
router.post("/admin/sizes", authAdmin, addSize);
router.put("/admin/sizes/:sizeId", authAdmin, updateSize);
router.delete("/admin/sizes/:sizeId", authAdmin, removeSize);
router.put("/admin/price", authAdmin, updatePrice);
router.put("/admin/canvas", authAdmin, updateCanvas);

module.exports = router;
