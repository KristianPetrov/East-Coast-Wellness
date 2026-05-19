import { Resend } from "resend";
import type { orders, orderItems } from "@/db/schema";
import { formatCents } from "./money";
import { getPaymentDetails } from "./orders";

type Order = typeof orders.$inferSelect;
type OrderItem = typeof orderItems.$inferSelect;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function orderHtml(order: Order, items: OrderItem[]) {
  const paymentDetails = getPaymentDetails(order);
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name} ${item.amount}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatCents(
            item.priceCents * item.quantity,
          )}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.5;">
      <h1>Order ${order.orderNumber}</h1>
      <p>Thank you for your order request. Payment is pending until confirmed by East Coast Wellness.</p>
      <p><strong>Payment method:</strong> ${paymentDetails.label}</p>
      <p><strong>Payment instructions:</strong> ${paymentDetails.instruction}</p>
      ${
        paymentDetails.href
          ? `<p><a href="${paymentDetails.href}" style="display:inline-block;background:#171411;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700;">${paymentDetails.actionLabel}</a></p>`
          : ""
      }
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="center">Qty</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="font-size:20px;"><strong>Total:</strong> ${formatCents(
        order.totalCents,
      )}</p>
      <p>Use your order number and email address to look up status updates.</p>
      <p style="font-size:12px;color:#62564c;">Products are intended for qualified laboratory research only and are not for human or animal consumption.</p>
    </div>
  `;
}

export async function sendOrderCreatedEmail(order: Order, items: OrderItem[]) {
  if (!resend) {
    return;
  }

  const from =
    process.env.ORDER_EMAIL_FROM ?? "East Coast Wellness <onboarding@resend.dev>";
  const subject = `Order ${order.orderNumber} created`;
  const html = orderHtml(order, items);

  const customerResult = await resend.emails.send(
    {
      from,
      to: [order.customerEmail],
      subject,
      html,
    },
    { idempotencyKey: `order-created/customer/${order.id}` },
  );

  if (customerResult.error) {
    console.error("Failed to send customer order email", customerResult.error);
  }

  if (!process.env.ORDER_NOTIFICATION_EMAIL) {
    return;
  }

  const adminResult = await resend.emails.send(
    {
      from,
      to: [process.env.ORDER_NOTIFICATION_EMAIL],
      subject: `New ${subject}`,
      html,
    },
    { idempotencyKey: `order-created/admin/${order.id}` },
  );

  if (adminResult.error) {
    console.error("Failed to send admin order email", adminResult.error);
  }
}
