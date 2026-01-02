const Order = require("../models/Order");
const Product = require("../models/Product");
const { getDateStringsBetween } = require("../utils/dateRange");


// -------------------------------
// CREATE ORDER (Public)
// -------------------------------
exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      pricing,
      delivery,
      paymentMethod,
      stripePayment,
      orderStatus,
    } = req.body;
    // 🔒 Safety: ensure required customer fields exist
if (!customer?.addressLine) {
  return res.status(400).json({
    message: "Customer addressLine is required",
  });
}


    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    const order = new Order({
      customer,
      items,
      pricing,
      delivery,
      paymentMethod,
      stripePayment,

      orderStatus: orderStatus || "pending",
    });

    await order.save();

    return res.status(201).json({ order });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
};


// -------------------------------
// ADMIN: GET ALL ORDERS
// GET /api/orders/admin/all
// -------------------------------
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      orders,
    });
  } catch (err) {
    console.error("Get all orders admin error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// -------------------------------
// ADMIN: GET SINGLE ORDER
// GET /api/orders/admin/:id
// -------------------------------
exports.getSingleOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (err) {
    console.error("Get single order admin error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// -------------------------------
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/admin/:id/status
// body: { status: "confirmed" | "dispatched" | "completed" | "cancelled", note?: "" }
// -------------------------------
// -------------------------------
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/admin/:id/status
// -------------------------------
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "dispatched",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;

    // optional: status history
    if (Array.isArray(order.statusHistory)) {
      order.statusHistory.push({
        status,
        at: new Date(),
      });
    }

    await order.save();

    return res.json({ order });
  } catch (err) {
    console.error("Update order status admin error:", err);
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

// PUBLIC: GET ALL ORDERS (limited, safe)
exports.getAllOrdersPublic = async (req, res) => {
  try {
    const orders = await Order.find({})
      .select("customer items pricing orderStatus paymentStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ orders });
  } catch (err) {
    console.error("Get orders public error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
// -------------------------------
// ADMIN: DELETE ORDER
// DELETE /api/orders/admin/:id
// -------------------------------
exports.deleteOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.deleteOne({ _id: req.params.id });

    return res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order admin error:", err);
    return res.status(500).json({ message: "Failed to delete order" });
  }
};
