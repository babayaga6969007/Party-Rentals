const stripe = require("../config/stripe");


const calculateOrderAmount = ({
  items = [],
  extraFees = 0,
  paymentMode = "FULL", // "FULL" or "PARTIAL"
}) => {
  //  Subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.lineTotal || 0);
  }, 0);


  //  Tax = 9.75% of subtotal
const tax = subtotal * 0.0975;

// 3 Subtotal after tax
const subtotalWithTax = subtotal + tax;

// 4 Labor charge = 14% of (subtotal + tax)
const laborCharge = subtotalWithTax * 0.14;

// 5 Discount (keep your existing logic if needed)
const discount = 0;

// 6 Grand total
const grandTotal =
  subtotalWithTax - discount + laborCharge + Number(extraFees || 0);

  //  Decide payable amount
  const payableAmount =
    paymentMode === "PARTIAL" ? grandTotal * 0.6 : grandTotal;

  // Stripe expects smallest currency unit
  return Math.round(payableAmount * 100);
};



exports.createPaymentIntent = async (req, res) => {
  try {
const { items, extraFees, paymentMode, orderId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Cart items are required",
      });
    }

const amount = calculateOrderAmount({
  items,
  extraFees,
  paymentMode, // "FULL" or "PARTIAL"
});

    const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency: "usd",
  automatic_payment_methods: { enabled: true },
  metadata: {
    orderId: orderId,              // ⭐ CRITICAL
    source: "checkout",
    paymentMode: paymentMode || "FULL",
  },
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
