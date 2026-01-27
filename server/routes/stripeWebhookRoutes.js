const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT: raw body required
router.post(
  "/",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event;

    try {
      const signature = req.headers["stripe-signature"];

      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Stripe webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // For now, just log the event
    console.log("✅ Stripe Event Received:", event.type);

    res.json({ received: true });
  }
);

module.exports = router;
