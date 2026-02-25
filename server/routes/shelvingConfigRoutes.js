const express = require("express");
const router = express.Router();
const {
  getConfig,
  updateTierA,
  updateTierB,
  updateTierC,
  addTierASize,
  updateTierASize,
  removeTierASize,
} = require("../controllers/shelvingConfigController");
const authAdmin = require("../middleware/authAdmin");

// Public route to get config (for frontend)
router.get("/", getConfig);

// Admin routes
router.get("/admin", authAdmin, getConfig);
router.put("/admin/tier-a", authAdmin, updateTierA);
router.put("/admin/tier-b", authAdmin, updateTierB);
router.put("/admin/tier-c", authAdmin, updateTierC);
router.post("/admin/tier-a/sizes", authAdmin, addTierASize);
router.put("/admin/tier-a/sizes/:sizeId", authAdmin, updateTierASize);
router.delete("/admin/tier-a/sizes/:sizeId", authAdmin, removeTierASize);

module.exports = router;
