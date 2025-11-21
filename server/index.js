const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// connect db
connectDB();

// test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Party Rentals API is running" });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
