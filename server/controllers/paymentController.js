const stripe = require("../config/stripe");


const calculateOrderAmount = ({
  items = [],
  extraFees = 0,
  paymentMode = "FULL",
  shippingCost = 0,
}) => {
  //  Subtotal
  // 1️⃣ Subtotal
const subtotal = items.reduce((sum, item) => {
  return sum + Number(item.lineTotal || 0);
}, 0);

// 2️⃣ Add shipping
const baseAmount = subtotal + Number(shippingCost || 0);

// 3️⃣ Tax
const tax = baseAmount * 0.0975;

// 4️⃣ Subtotal after tax
const subtotalWithTax = baseAmount + tax;

// 5️⃣ Labor
const laborCharge = subtotalWithTax * 0.14;

// 6️⃣ Discount
const discount = 0;

// 7️⃣ Final total
const grandTotal =
  subtotalWithTax - discount + laborCharge + Number(extraFees || 0);

// 8️⃣ Payment mode
const payableAmount =
  paymentMode === "PARTIAL" ? grandTotal * 0.6 : grandTotal;

return Math.round(payableAmount * 100);
};



exports.createPaymentIntent = async (req, res) => {
  try {
const { items, extraFees, paymentMode, orderId, shippingCost } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Cart items are required",
      });
    }

const amount = calculateOrderAmount({
  items,
  extraFees,
  paymentMode,
  shippingCost,
});
f
    const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency: "usd",
  automatic_payment_methods: { enabled: true },
 metadata: {
  orderId: orderId || "temp_order",
  source: "checkout",
  paymentMode: paymentMode || "FULL",
  itemsCount: items.length.toString(),
  hasShipping: shippingCost ? "yes" : "no",
}
});


    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
