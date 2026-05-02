exports.adminOrderEmail = (order) => ({
  subject: `🛒 New Order Received – ${order._id}`,
  html: `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6">

    <h2 style="color:#8B5C42;">New Order Received</h2>

    <hr/>

    <h3>📦 Order Summary</h3>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><strong>Total:</strong> $${order.pricing.total.toFixed(2)}</p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

    <hr/>

    <h3>👤 Customer Details</h3>
    <p>
      <strong>Name:</strong> ${order.customer.name}<br/>
      <strong>Email:</strong> ${order.customer.email}<br/>
      <strong>Phone:</strong> ${order.customer.phone || "—"}<br/>
      <strong>Address:</strong> ${order.customer.addressLine},
      ${order.customer.city || ""} ${order.customer.postalCode || ""}
    </p>

    ${
      order.delivery
        ? `
        <hr/>
        <h3>🚚 Delivery / Pickup</h3>
        <p>
          <strong>Delivery Date:</strong> ${order.delivery.deliveryDate || "—"}<br/>
          <strong>Pickup Date:</strong> ${order.delivery.pickupDate || "—"}<br/>
          <strong>Delivery Time:</strong> ${order.delivery.deliveryTime || "—"}<br/>
          <strong>Pickup Time:</strong> ${order.delivery.pickupTime || "—"}<br/>
          <strong>Stairs Service:</strong> ${
            order.delivery.services?.stairs ? "Yes" : "No"
          }
        </p>
      `
        : ""
    }

    <hr/>

    <h3>🛒 Items</h3>
    <ul>
      ${order.items.map(item => `
        <li>
          <strong>${item.name}</strong>
          (${item.productType}) – Qty: ${item.qty},
          Total: $${item.lineTotal?.toFixed(2)}
          ${item.startDate && item.endDate ? ` | ${item.startDate} → ${item.endDate}` : ""}
        </li>
      `).join("")}
    </ul>

    <hr/>

    <p><strong>Action Required:</strong> Review and prepare order.</p>

  </div>
  `,
});