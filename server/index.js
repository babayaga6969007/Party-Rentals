const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// ✅ Middlewares FIRST
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // (safe add)
app.post("/api/debug-body", (req, res) => {
  res.json({ received: req.body, headers: req.headers["content-type"] });
});


// ✅ Connect DB
connectDB();

// ✅ Routes imports
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const orderRoutes = require("./routes/orderRoutes");

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Party Rentals API is running" });
});

// ✅ Mount routes AFTER middleware
app.use("/api/admin", adminAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
