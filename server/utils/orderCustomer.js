exports.customerOrderEmail = (order) => ({
  subject: `Order Confirmed – ${order._id}`,
  html: `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6">
    
    <h2 style="color:#8B5C42;">Thank you for your order, ${order.customer?.name || "Customer"}!</h2>

    <p>Your order has been successfully placed. Below are your order details:</p>

    <hr/>

    <h3>📦 Order Details</h3>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod || "Online"}</p>

    <hr/>

    <h3>👤 Customer Information</h3>
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
        ${order.delivery.deliveryDate ? `
          <p><strong>Delivery:</strong> ${order.delivery.deliveryDate}
          ${order.delivery.deliveryTime ? `(${order.delivery.deliveryTime})` : ""}</p>
        ` : ""}
        ${order.delivery.pickupDate ? `
          <p><strong>Pickup:</strong> ${order.delivery.pickupDate}
          ${order.delivery.pickupTime ? `(${order.delivery.pickupTime})` : ""}</p>
        ` : ""}
        ${
          order.delivery.services
            ? `<p><strong>Services:</strong>
                ${order.delivery.services.stairs ? "Stairs " : ""}
                ${order.delivery.services.setup ? "Setup " : ""}
              </p>`
            : ""
        }
      `
        : ""
    }

    <hr/>

    <h3>🛒 Items Ordered</h3>
    <table width="100%" cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;">
      <thead style="background:#f4f4f4;">
        <tr>
          <th align="left">Item</th>
          <th>Type</th>
          <th>Qty</th>
          <th align="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>
              <strong>${item.name}</strong>
              ${item.startDate && item.endDate ? `<br/><small>${item.startDate} → ${item.endDate}</small>` : ""}
            </td>
            <td align="center">${item.productType}</td>
            <td align="center">${item.qty}</td>
            <td align="right">$${item.lineTotal?.toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <h3 style="margin-top:20px;">💰 Payment Summary</h3>
    <p><strong>Total Amount:</strong> $${order.pricing.total.toFixed(2)}</p>

    <hr/>

    <p>We will contact you shortly for further coordination.</p>

    <p style="margin-top:30px;">
      Warm regards,<br/>
      <strong>Your Brand Name</strong>
    </p>

  </div>
  `,
});
