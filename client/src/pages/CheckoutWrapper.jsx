import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../stripe";
import CheckoutPage from "./CheckoutPage";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function CheckoutWrapper() {
  const { cartItems } = useCart();
  const [clientSecret, setClientSecret] = useState("");

  // calculate extraFees later inside CheckoutPage
  // here we only initialize Stripe once
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    fetch("http://localhost:5000/api/payments/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems,
        extraFees: 0, // initial (will be updated later)
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch(console.error);
  }, [cartItems]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Initializing checkout...
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret }}   // 🔥 THIS WAS MISSING
    >
      <CheckoutPage />
    </Elements>
  );
}
