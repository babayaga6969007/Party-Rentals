const Coupon = require("../models/Coupon");

module.exports = async function validateCoupon(req, res, next) {
  try {
    const { code, cartSubtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    // Expiry check
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    // Usage limit
    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res
        .status(400)
        .json({ message: "Coupon usage limit reached" });
    }

    // Minimum cart value
    if (cartSubtotal < coupon.minCartValue) {
      return res.status(400).json({
        message: `Minimum cart value is $${coupon.minCartValue}`,
      });
    }

    // Calculate discount
    let discount = 0;

    if (coupon.discountType === "percent") {
      discount = (cartSubtotal * coupon.discountValue) / 100;

      if (
        coupon.maxDiscountAmount !== null &&
        discount > coupon.maxDiscountAmount
      ) {
        discount = coupon.maxDiscountAmount;
      }
    }

    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    // Attach to request
    req.coupon = coupon;
    req.discount = discount;

    next();
  } catch (err) {
    console.error("COUPON VALIDATION ERROR:", err);
    res.status(500).json({ message: "Coupon validation failed" });
  }
};
