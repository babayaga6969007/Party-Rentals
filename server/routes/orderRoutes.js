const express = require("express");
const router = express.Router();

const authAdmin = require("../middleware/authAdmin");
const orderController = require("../controllers/orderController");

// ✅ BASE PUBLIC (IMPORTANT)
router.get("/", orderController.getAllOrdersPublic);

// Public
router.post("/", orderController.createOrder);

// Admin
router.get("/admin/all", authAdmin, orderController.getAllOrdersAdmin);
router.get("/admin/:id", authAdmin, orderController.getSingleOrderAdmin);
router.patch("/admin/:id/status", authAdmin, orderController.updateOrderStatusAdmin);

module.exports = router;
