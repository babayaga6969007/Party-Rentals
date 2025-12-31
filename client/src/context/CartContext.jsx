import { createContext, useContext, useState } from "react";
import { useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
const [cartItems, setCartItems] = useState(() => {
  try {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
});

  const addToCart = (item) => {
  setCartItems((prev) => {
    const exists = prev.find((p) => p.id === item.id);

    // ❌ Do NOT add again if already in cart
    if (exists) {
      return prev;
    }

    return [...prev, item];
  });
};


 const updateQty = (id, delta) => {
  setCartItems((prev) =>
    prev.map((item) => {
      if (item.id !== id) return item;

      const nextQty = item.qty + delta;

      // Enforce limits
      if (nextQty < 1) return { ...item, qty: 1 };
      if (nextQty > item.maxStock) return item;

      return { ...item, qty: nextQty };
    })
  );
};

useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}, [cartItems]);

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

const clearCart = () => {
  setCartItems([]);
  localStorage.removeItem("cart");
};

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
