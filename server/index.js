
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const productRoutes = require("./routes/productRoutes");

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api/products", require("./routes/productRoutes"));

// connect db
connectDB();

// test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Party Rentals API is running" });
});
// routes
app.use("/api/admin", adminAuthRoutes);
app.use("/api/products", productRoutes);

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
