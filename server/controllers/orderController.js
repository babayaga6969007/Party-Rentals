const Order = require("../models/Order");
const Product = require("../models/Product");
const { getDateStringsBetween } = require("../utils/dateRange");


// -------------------------------
// CREATE ORDER (Public)
// -------------------------------
exports.createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const { customer, items, pricing, paymentStatus, notes } = body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order payload." });
    }

    if (!pricing || typeof pricing.total !== "number") {
      return res.status(400).json({ message: "Pricing is required." });
    }

    // Minimum order amount: 1000
    if (pricing.total < 1000) {
      return res
        .status(400)
        .json({ message: "Minimum order amount is $1000. Add more items to proceed." });
    }

    // (Optional later) validate rental dates here
    // For now we store whatever frontend sends.

    const order = await Order.create({
      customer,
      items,
      pricing,
      paymentStatus: paymentStatus || "unpaid",
      orderStatus: "pending",
      notes: notes || "",
      statusHistory: [{ status: "pending", note: "Order created" }],
    });

    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: err.message || "Server error" });
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
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note } = req.body || {};

    const allowed = ["pending", "confirmed", "dispatched", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const flow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["dispatched", "cancelled"],
      dispatched: ["completed"],
      completed: [],
      cancelled: [],
    };

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const current = order.orderStatus;
    if (!flow[current].includes(status) && current !== status) {
      return res.status(400).json({
        message: `Invalid transition: ${current} → ${status}`,
      });
    }

    // ✅ If confirming, block rental dates
    if (current !== "confirmed" && status === "confirmed") {
      // Only rental items should block dates
      const rentalItems = (order.items || []).filter(
        (it) => (it.productType || "").toLowerCase() === "rental"
      );

      // Validate rental items contain dates
      for (const it of rentalItems) {
        if (!it.productId) {
          return res.status(400).json({ message: "Rental item missing productId." });
        }
        if (!it.startDate || !it.endDate) {
          return res.status(400).json({
            message: `Rental item "${it.name}" is missing startDate/endDate.`,
          });
        }
      }

      // Check conflicts + apply blocks
      for (const it of rentalItems) {
        const product = await Product.findById(it.productId);
        if (!product) {
          return res.status(404).json({
            message: `Product not found for rental item: ${it.name}`,
          });
        }

        const datesToBlock = getDateStringsBetween(it.startDate, it.endDate);

        // Conflict check
        const blockedSet = new Set(product.blockedDates || []);
        const conflict = datesToBlock.find((d) => blockedSet.has(d));
        if (conflict) {
          return res.status(400).json({
            message: `Product "${product.name}" is not available on ${conflict}.`,
          });
        }

        // Apply blocks
        product.blockedDates = [...(product.blockedDates || []), ...datesToBlock];
        // remove duplicates
        product.blockedDates = Array.from(new Set(product.blockedDates));
        await product.save();
      }
    }

    // Save status + history
    order.orderStatus = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      at: new Date(),
    });

    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order status admin error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
