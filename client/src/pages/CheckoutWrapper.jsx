import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../stripe";
import CheckoutPage from "./CheckoutPage";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";


export default function CheckoutWrapper() {
  const { cartItems } = useCart();
  const [clientSecret, setClientSecret] = useState("");

  // calculate extraFees later inside CheckoutPage
  // here we only initialize Stripe once
  useEffect(() => {
  const init = async () => {
    try {
      if (!cartItems || cartItems.length === 0) return;

      const data = await api("/payments/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            lineTotal: i.lineTotal,
          })),
          extraFees: 0,
        }),
      });

      setClientSecret(data.clientSecret);
    } catch (e) {
      console.error(e);
    }
  };

  init();
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
