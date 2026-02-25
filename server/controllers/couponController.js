const Coupon = require("../models/Coupon");

exports.applyCoupon = (req, res) => {
  const { coupon, discount } = req;

  res.json({
    code: coupon.code,
    discount,
    discountType: coupon.discountType,
  });
};

exports.incrementCouponUsage = async (code) => {
  await Coupon.findOneAndUpdate(
    { code },
    { $inc: { usedCount: 1 } }
  );
};
