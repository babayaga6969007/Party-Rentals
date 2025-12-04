const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
app.use("/uploads", express.static("uploads"));

// FORCE CORRECT ROUTE IMPORTS
const adminAuthRoutes = require(__dirname + "/routes/adminAuthRoutes.js");
const productRoutes = require(__dirname + "/routes/productRoutes.js");

// Middlewares
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Party Rentals API is running" });
});

// Routes
app.use("/api/admin", adminAuthRoutes);
app.use("/api/products", productRoutes);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
