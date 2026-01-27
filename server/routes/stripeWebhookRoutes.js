const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Order = require("../models/Order");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT: raw body required
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {   // ✅ async added
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

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      console.log("✅ Stripe Event Received:", event.type);
      console.log("🔎 PaymentIntent ID:", paymentIntent.id);

      const order = await Order.findOne({
        "stripePayment.paymentIntentId": paymentIntent.id,
      });

      if (!order) {
        console.warn("⚠️ No order found for PaymentIntent:", paymentIntent.id);
        return res.json({ received: true });
      }

      if (order.paymentStatus === "paid") {
        console.log("ℹ️ Order already marked as paid:", order._id);
        return res.json({ received: true });
      }

      order.paymentStatus = "paid";
      order.stripePayment.status = "succeeded";

      const amountReceived = paymentIntent.amount_received / 100;
      order.amountPaid = amountReceived;

      if (order.paymentType === "FULL") {
        order.amountDue = 0;
      }

      await order.save();

      console.log("✅ Order marked as PAID:", order._id);
    }

    res.json({ received: true });
  }
);
