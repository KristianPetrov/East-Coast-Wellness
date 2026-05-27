import { Resend } from "resend";
import type { orders, orderItems } from "@/db/schema";
import { formatCents } from "./money";
import {
  buildVenmoPaymentUrl,
  getPaymentDetails,
  zellePhone,
} from "./orders";

type Order = typeof orders.$inferSelect;
type OrderItem = typeof orderItems.$inferSelect;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function getFromAddress() {
  return (
    process.env.ORDER_EMAIL_FROM ??
    "East Coast Wellness <orders@eastcoastwellness.co>"
  );
}

function getAdminNotificationEmail() {
  return process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function baseEmailHtml(content: string) {
  return `
    <div style="margin:0;background:#f7f2ea;padding:32px 16px;font-family:Arial,sans-serif;color:#171411;line-height:1.5;">
      <div style="max-width:640px;margin:0 auto;border:1px solid #eadfce;border-radius:28px;background:#ffffff;overflow:hidden;">
        <div style="background:#171411;padding:24px;color:#ffffff;">
          <p style="margin:0;color:#ff9b32;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">East Coast Wellness</p>
        </div>
        <div style="padding:28px;">
          ${content}
        </div>
      </div>
      <p style="max-width:640px;margin:16px auto 0;color:#62564c;font-size:12px;text-align:center;">
        Products are intended for qualified laboratory research only and are not for human or animal consumption.
      </p>
    </div>
  `;
}

function itemRowsHtml(items: OrderItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(item.name)}</strong><br />
            <span style="color:#62564c;font-size:13px;">${escapeHtml(item.amount)}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;">${formatCents(
            item.priceCents * item.quantity,
          )}</td>
        </tr>
      `,
    )
    .join("");
}

function manualPaymentHtml(order: Order) {
  const venmoUrl = buildVenmoPaymentUrl(order);

  return `
    <div style="margin:20px 0;padding:18px;border-radius:20px;background:#fff8ef;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#a24b00;text-transform:uppercase;letter-spacing:0.12em;">Manual Payment Options</p>
      <p style="margin:0 0 10px;"><strong>Venmo</strong></p>
      <p style="margin:0 0 12px;color:#62564c;">Pay @coastalwellnessgroupllc. The button includes ${escapeHtml(
        order.orderNumber,
      )} in the note.</p>
      <p style="margin:0 0 18px;"><a href="${escapeHtml(
        venmoUrl,
      )}" style="display:inline-block;background:#171411;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700;">Pay with Venmo</a></p>
      <p style="margin:0 0 10px;"><strong>Zelle</strong></p>
      <p style="margin:0;color:#62564c;">Send ${formatCents(
        order.totalCents,
      )} to ${escapeHtml(zellePhone)} and include ${escapeHtml(
        order.orderNumber,
      )} in the memo.</p>
    </div>
  `;
}

function orderCreatedHtml(order: Order, items: OrderItem[]) {
  const paymentDetails = getPaymentDetails(order);

  return baseEmailHtml(`
      <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;">Order ${escapeHtml(
        order.orderNumber,
      )} received</h1>
      <p style="margin:0 0 20px;color:#62564c;">Thank you for your order request. Payment is pending until confirmed by East Coast Wellness.</p>                                                                                                                                                 
      <div style="margin:20px 0;padding:18px;border-radius:20px;background:#fff8ef;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#a24b00;text-transform:uppercase;letter-spacing:0.12em;">Payment</p>
        <p style="margin:0;"><strong>${paymentDetails.label}</strong></p>
        <p style="margin:8px 0 0;color:#62564c;">${escapeHtml(
          paymentDetails.instruction,
        )}</p>
      </div>
      ${manualPaymentHtml(order)}
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th align="left" style="padding-bottom:8px;">Item</th>
            <th align="center" style="padding-bottom:8px;">Qty</th>
            <th align="right" style="padding-bottom:8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRowsHtml(items)}</tbody>
      </table>
      <p style="font-size:20px;text-align:right;"><strong>Total:</strong> ${formatCents(
        order.totalCents,
      )}</p>
      <p style="color:#62564c;">Use your order number and email address to look up status updates.</p>
  `);
}

export async function sendOrderCreatedEmail(order: Order, items: OrderItem[]) {
  if (!resend) {
    return;
  }

  const from = getFromAddress();
  const subject = `Order ${order.orderNumber} created`;
  const html = orderCreatedHtml(order, items);

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

  const adminEmail = getAdminNotificationEmail();

  if (!adminEmail) {
    return;
  }

  const adminResult = await resend.emails.send(
    {
      from,
      to: [adminEmail],
      subject: `New ${subject}`,
      html,
    },
    { idempotencyKey: `order-created/admin/${order.id}` },
  );

  if (adminResult.error) {
    console.error("Failed to send admin order email", adminResult.error);
  }
}

function orderStatusHtml(order: Order, items: OrderItem[]) {
  return baseEmailHtml(`
      <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;">Order ${escapeHtml(
        order.orderNumber,
      )} updated</h1>
      <p style="margin:0 0 20px;color:#62564c;">There is an update to your East Coast Wellness order.</p>
      <div style="display:grid;gap:12px;margin:20px 0;">
        <div style="padding:16px;border-radius:18px;background:#fff8ef;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#a24b00;text-transform:uppercase;letter-spacing:0.12em;">Order</p>
          <p style="margin:0;font-size:18px;font-weight:700;text-transform:capitalize;">${escapeHtml(
            order.orderStatus,
          )}</p>
          ${
            order.orderStatus === "cancelled"
              ? `<p style="margin:8px 0 0;color:#62564c;">This order has been cancelled and its items have been returned to inventory.</p>`
              : ""
          }
        </div>
        <div style="padding:16px;border-radius:18px;background:#fff8ef;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#a24b00;text-transform:uppercase;letter-spacing:0.12em;">Payment</p>
          <p style="margin:0;font-size:18px;font-weight:700;text-transform:capitalize;">${escapeHtml(
            order.paymentStatus,
          )}</p>
        </div>
        <div style="padding:16px;border-radius:18px;background:#fff8ef;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#a24b00;text-transform:uppercase;letter-spacing:0.12em;">Shipping</p>
          <p style="margin:0;font-size:18px;font-weight:700;text-transform:capitalize;">${escapeHtml(
            order.shippingStatus,
          )}</p>
          ${
            order.carrier && order.trackingNumber
              ? `<p style="margin:8px 0 0;color:#62564c;">${escapeHtml(
                  order.carrier,
                )} tracking: ${escapeHtml(order.trackingNumber)}</p>`
              : ""
          }
        </div>
      </div>
      ${order.orderStatus === "cancelled" ? "" : manualPaymentHtml(order)}
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th align="left" style="padding-bottom:8px;">Item</th>
            <th align="center" style="padding-bottom:8px;">Qty</th>
            <th align="right" style="padding-bottom:8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRowsHtml(items)}</tbody>
      </table>
      <p style="font-size:20px;text-align:right;"><strong>Total:</strong> ${formatCents(
        order.totalCents,
      )}</p>
  `);
}

export async function sendOrderStatusUpdatedEmail(
  order: Order,
  items: OrderItem[],
) {
  if (!resend) {
    return;
  }

  const result = await resend.emails.send(
    {
      from: getFromAddress(),
      to: [order.customerEmail],
      subject: `Order ${order.orderNumber} updated`,
      html: orderStatusHtml(order, items),
    },
    {
      idempotencyKey: `order-status/customer/${order.id}/${order.updatedAt.getTime()}`,
    },
  );

  if (result.error) {
    console.error("Failed to send customer order status email", result.error);
  }
}
