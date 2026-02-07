import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

// 🔑 rental items must be uniquely identified by dates + addons (including vinyl color vs image)
// 🔑 purchase items with different customTitle (e.g. telephone booth) are separate lines
const buildCartKey = (item) => {
  if (item.productType === "rental") {
    const addonKey = Array.isArray(item.addons)
      ? item.addons
          .map(
            (a) =>
              `${a.optionId || a.name}:${a.vinylColor || ""}:${a.vinylImageUrl || ""}`
          )
          .join("|")
      : "";
    const titleKey = (item.customTitle && String(item.customTitle).trim()) ? String(item.customTitle).trim() : "";
    return `${item.productId}__${item.startDate}__${item.endDate}__${addonKey}__${titleKey}`;
  }
  const titleKey = (item.customTitle && String(item.customTitle).trim()) ? String(item.customTitle).trim() : "";
  return `${item.productId}__purchase__${titleKey}`;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ ADD TO CART (SALE + RENTAL)
  const addToCart = (payload) => {
    const normalized = {
      cartKey: "",

      productId: payload.productId || payload.id,
      name: payload.name,
      productType: payload.productType || "purchase",

      qty: Number(payload.qty || 1),
      unitPrice: Number(payload.unitPrice ?? payload.price ?? 0),

      // rental-only
      days: Number(payload.days || 0),
      startDate: payload.startDate || "",
      endDate: payload.endDate || "",
      addons: payload.addons || [],

      // signage-only
      signageData: payload.signageData || null,

      // Custom title when product allows it
      customTitle: payload.customTitle ? String(payload.customTitle).trim() : "",

      image: payload.image || "",
      maxStock: Number(payload.maxStock || 1),

      // 🔒 FINAL PRICE SNAPSHOT
      lineTotal: Number(payload.lineTotal || payload.totalPrice),
    };

    normalized.cartKey = buildCartKey(normalized);

    setCartItems((prev) => {
      const index = prev.findIndex((i) => {
  // 🔒 SALE: same productId always merges
  if (normalized.productType === "purchase") {
    return (
      i.productType === "purchase" &&
      i.productId === normalized.productId
    );
  }

  // 🔓 RENTAL: must match cartKey (dates + addons)
  return i.cartKey === normalized.cartKey;
});

if (index === -1) return [...prev, normalized];


      // already exists → increase qty (respect stock)
      const existing = prev[index];
      const newQty = Math.min(
        existing.qty + normalized.qty,
        existing.maxStock
      );

      const updated = [...prev];
      updated[index] = {
        ...existing,
        qty: newQty,
        lineTotal:
          existing.productType === "rental"
            ? (existing.lineTotal / existing.qty) * newQty
            : existing.unitPrice * newQty,
      };

      return updated;
    });
  };

  // ✅ UPDATE QTY
  const updateQty = (cartKey, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartKey !== cartKey) return item;

        const nextQty = Math.max(
          1,
          Math.min(item.qty + delta, item.maxStock)
        );

        return {
          ...item,
          qty: nextQty,
          lineTotal:
            item.productType === "rental"
              ? (item.lineTotal / item.qty) * nextQty
              : item.unitPrice * nextQty,
        };
      })
    );
  };

  const removeItem = (cartKey) => {
    setCartItems((prev) =>
      prev.filter((item) => item.cartKey !== cartKey)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.lineTotal, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
