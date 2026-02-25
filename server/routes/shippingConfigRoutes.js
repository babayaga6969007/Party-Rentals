const express = require("express");
const router = express.Router();
const {
  getConfig,
  updateDistanceRanges,
  addDistanceRange,
  updateDistanceRange,
  removeDistanceRange,
  updateWarehouse,
} = require("../controllers/shippingConfigController");
const authAdmin = require("../middleware/authAdmin");

// Public route to get config (for frontend)
router.get("/", getConfig);

// Admin routes
router.get("/admin", authAdmin, getConfig);
router.put("/admin/distance-ranges", authAdmin, updateDistanceRanges);
router.post("/admin/distance-ranges", authAdmin, addDistanceRange);
router.put("/admin/distance-ranges/:rangeId", authAdmin, updateDistanceRange);
router.delete("/admin/distance-ranges/:rangeId", authAdmin, removeDistanceRange);
router.put("/admin/warehouse", authAdmin, updateWarehouse);

module.exports = router;
