const express = require("express");
const validateCoupon = require("../middleware/validateCoupon");
const { applyCoupon } = require("../controllers/couponController");

const router = express.Router();

// POST /api/coupons/validate
router.post("/validate", validateCoupon, applyCoupon);

module.exports = router;
