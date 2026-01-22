const express = require("express");
const router = express.Router();
const {
  getConfig,
  updateConfig,
  addSize,
  updateSize,
  removeSize,
  updatePrice,
} = require("../controllers/signageConfigController");
const authAdmin = require("../middleware/authAdmin");

// Public route to get config (for frontend)
router.get("/", getConfig);

// Admin routes
router.get("/admin", authAdmin, getConfig);
router.put("/admin", authAdmin, updateConfig);
router.post("/admin/sizes", authAdmin, addSize);
router.put("/admin/sizes/:sizeId", authAdmin, updateSize);
router.delete("/admin/sizes/:sizeId", authAdmin, removeSize);
router.put("/admin/price", authAdmin, updatePrice);

module.exports = router;
