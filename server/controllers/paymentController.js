const stripe = require("../config/stripe");

/**
 * IMPORTANT:
 * Prices must ALWAYS be calculated on backend
 * Frontend prices are NEVER trusted
 */
const calculateOrderAmount = ({ items = [], extraFees = 0 }) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.lineTotal || 0);
  }, 0);

  const discount = subtotal * 0.1;
  const deliveryFee = 10;

  const total =
    subtotal - discount + deliveryFee + Number(extraFees || 0);

  // Stripe expects smallest currency unit
  return Math.round(total * 100);
};


exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, extraFees } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Cart items are required",
      });
    }

    const amount = calculateOrderAmount({ items, extraFees });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd", // test currency (works in Nepal)
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: "checkout-test",
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
