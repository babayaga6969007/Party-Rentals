const stripe = require("../config/stripe");


const calculateOrderAmount = ({
  items = [],
  extraFees = 0,
  paymentMode = "FULL", // "FULL" or "PARTIAL"
}) => {
  // 1️⃣ Subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.lineTotal || 0);
  }, 0);

  // 2️⃣ Labor charge = 14% of subtotal
  const laborCharge = subtotal * 0.14;

  // 3️⃣ Discount (keep your existing logic if needed)
  const discount = subtotal * 0.1;


  // 4️⃣ Grand total
  const grandTotal =
    subtotal - discount + laborCharge + Number(extraFees || 0);

  // 5️⃣ Decide payable amount
  const payableAmount =
    paymentMode === "PARTIAL" ? grandTotal * 0.6 : grandTotal;

  // Stripe expects smallest currency unit
  return Math.round(payableAmount * 100);
};



exports.createPaymentIntent = async (req, res) => {
  try {
const { items, extraFees, paymentMode } = req.body;

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
      currency: "usd", // test currency (works in Nepal)
      automatic_payment_methods: { enabled: true },
      metadata: {
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
