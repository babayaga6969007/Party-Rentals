const express = require("express");
const Coupon = require("../models/Coupon");
const adminAuth = require("../middleware/authAdmin");

const router = express.Router();

/**
 * CREATE COUPON
 * POST /api/admin/coupons
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET ALL COUPONS
 * GET /api/admin/coupons
 */
router.get("/", adminAuth, async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

/**
 * TOGGLE ACTIVE
 * PATCH /api/admin/coupons/:id/toggle
 */
router.patch("/:id/toggle", adminAuth, async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.json(coupon);
});

/**
 * DELETE COUPON
 * DELETE /api/admin/coupons/:id
 */
router.delete("/:id", adminAuth, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: "Coupon deleted" });
});

module.exports = router;
