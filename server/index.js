require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

/* =========================
   APP INIT
========================= */
const app = express();

/* =========================
   ALLOWED ORIGINS
========================= */
const allowedOrigins = [
  "http://localhost:5173",                  // local dev
  "https://party-rentals-ochre.vercel.app", // old prod (can keep)
  "https://party-rentals.vercel.app",       // old prod (can keep)
  "https://newprojectdesigns.com",           // NEW prod
  "https://www.newprojectdesigns.com"        // NEW prod (www)
];


/* =========================
   GLOBAL MIDDLEWARES
========================= */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options(/.*/, cors());
// 🔔 Stripe Webhook (MUST be before express.json)
app.use("/api/stripe/webhook", require("./routes/stripeWebhookRoutes"));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* =========================
   STATIC FILES
========================= */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".png")) res.set("Content-Type", "image/png");
      if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg"))
        res.set("Content-Type", "image/jpeg");
      if (filePath.endsWith(".webp")) res.set("Content-Type", "image/webp");
    },
  })
);

/* =========================
   ROUTE IMPORTS
========================= */
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminCouponRoutes = require("./routes/adminCouponRoutes");
const couponRoutes = require("./routes/couponRoutes");
const signageConfigRoutes = require("./routes/signageConfigRoutes");
const shelvingConfigRoutes = require("./routes/shelvingConfigRoutes");
const shippingConfigRoutes = require("./routes/shippingConfigRoutes");

/* =========================
   DATABASE
========================= */
connectDB();

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Party Rentals API is running",
  });
});

/* =========================
   API ROUTES
========================= */

// 🔐 Admin auth
app.use("/api/admin", adminAuthRoutes);

// 📦 Core resources
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// 🎟️ Coupons
app.use("/api/coupons", couponRoutes);              // public validation
app.use("/api/admin/coupons", adminCouponRoutes);   // admin CRUD

// 🧩 Admin attributes
app.use("/api/admin/attributes", attributeRoutes);

// 🎨 Signage Config (for admin to manage fonts/sizes)
app.use("/api/signage-config", signageConfigRoutes);
// Note: Signage creation removed - metadata is stored directly in orders

// 📦 Shelving Config (for admin to manage shelving tiers/sizes/prices)
app.use("/api/shelving-config", shelvingConfigRoutes);

// 🚚 Shipping Config (for admin to manage distance-based shipping prices)
app.use("/api/shipping-config", shippingConfigRoutes);

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
