const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// ✅ Route imports
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

/* =========================
   GLOBAL MIDDLEWARES
========================= */

// CORS (open for now; can restrict later)
const allowedOrigins = [
  "http://localhost:5173",
  "https://party-rentals-ochre.vercel.app",
  "https://party-rentals.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman / Render health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   DEBUG (OPTIONAL – SAFE)
========================= */
app.post("/api/debug-body", (req, res) => {
  res.json({
    received: req.body,
    contentType: req.headers["content-type"],
  });
});

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

// Admin auth
app.use("/api/admin", adminAuthRoutes);

// Core resources
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/orders", orderRoutes);

/* =========================
   404 HANDLER (IMPORTANT)
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
