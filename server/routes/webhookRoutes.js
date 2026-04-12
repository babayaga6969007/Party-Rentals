const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    //  HANDLE SUCCESSFUL PAYMENT
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      console.log("💰 PaymentIntent succeeded:", paymentIntent.id);

      
    }

    res.json({ received: true });
  }
);

module.exports = router;