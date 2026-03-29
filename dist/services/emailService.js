"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactEmail = exports.sendGuestTicketsEmail = exports.sendEventCancelledEmail = exports.sendEventUpdatedEmail = exports.sendTicketsEmail = exports.resetPasswordEmail = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const email_1 = require("../config/email");
const emailLogModel_1 = require("../models/emailLogModel");
const resetPasswordEmail = async ({ to, token }) => {
    const resetLink = `${email_1.emailConfig.frontendUrl}/reset-password?token=${token}`;
    try {
        await email_1.resend.emails.send({
            from: email_1.emailConfig.EMAIL_FROM,
            to,
            subject: "Reset your password",
            html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" 
           style="display:inline-block;
                  padding:10px 20px;
                  background:#f44336;
                  color:white;
                  text-decoration:none;
                  border-radius:6px;">
           Reset Password
        </a>

        <p>If the button doesn't work, use this link:</p>
        <p>${resetLink}</p>
      `,
        });
        console.log("Password reset email sent to", to);
    }
    catch (err) {
        console.error("Resend Email Error:", err);
        throw new Error("Could not send password reset email");
    }
};
exports.resetPasswordEmail = resetPasswordEmail;
const sendTicketsEmail = async ({ to, event, tickets, paymentId, }) => {
    try {
        // 1️⃣ Generate QR codes (data URL for inline + buffer for attachments)
        const qrResults = await Promise.all(tickets.map(async (ticket, index) => {
            const dataUrl = await qrcode_1.default.toDataURL(ticket.qrPayload);
            const buffer = await qrcode_1.default.toBuffer(ticket.qrPayload);
            return {
                index,
                dataUrl,
                buffer,
                ticketId: ticket._id,
            };
        }));
        // 2️⃣ Inline QR HTML
        const qrBlocks = qrResults
            .map((qr) => `
        <div style="margin-bottom: 20px;">
          <p><strong>Ticket ${qr.index + 1}</strong></p>
          <img src="${qr.dataUrl}" width="200" height="200" />
        </div>
      `)
            .join("");
        // 3️⃣ Email HTML
        const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>🎉 Payment Successful</h2>

        <p>
          Your payment for <strong>${event.title}</strong> was successful.
        </p>

        <h3>📍 Event Details</h3>
        <ul>
          <li><strong>Event:</strong> ${event.title}</li>
          <li><strong>Date & Time:</strong> ${new Date(event.startTime).toLocaleString("en-NG", {
            timeZone: "Africa/Lagos",
            dateStyle: "full",
            timeStyle: "short",
        })}</li>
          <li><strong>Location:</strong> ${event.location}</li>
        </ul>

        <h3>🎟 Your Ticket${tickets.length > 1 ? "s" : ""}</h3>
        <p>Please present the QR code(s) below at the event entrance.</p>

        ${qrBlocks}

        <p style="margin-top: 30px;">
          See you there!<br />
          <strong>${event.title}</strong>
        </p>
      </div>
    `;
        // 4️⃣ Attachments (Resend format)
        const attachments = qrResults.map((qr) => ({
            filename: `ticket-${qr.index + 1}.png`,
            content: qr.buffer.toString("base64"),
            type: "image/png",
            disposition: "attachment",
        }));
        // 5️⃣ Send via Resend
        await email_1.resend.emails.send({
            from: email_1.emailConfig.EMAIL_FROM,
            to,
            subject: `🎟 Your ticket${tickets.length > 1 ? "s" : ""} for ${event.title}`,
            html,
            attachments,
        });
        // 6️⃣ Log success
        await emailLogModel_1.EmailLog.create({
            to,
            subject: `Tickets for ${event.title}`,
            eventId: event._id,
            paymentId,
            ticketIds: tickets.map((t) => t._id),
            status: "SENT",
        });
    }
    catch (error) {
        // 7️⃣ Log failure
        await emailLogModel_1.EmailLog.create({
            to,
            subject: `Tickets for ${event.title}`,
            eventId: event._id,
            paymentId,
            ticketIds: tickets.map((t) => t._id),
            status: "FAILED",
            error: error.message,
        });
        throw error;
    }
};
exports.sendTicketsEmail = sendTicketsEmail;
const sendEventUpdatedEmail = async (emails, event, changes, creatorEmail) => {
    if (!emails.length || !changes.length)
        return;
    const changeRows = changes
        .map((c) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;text-transform:capitalize;">${c.field}</td>
        <td style="padding:8px 12px;text-decoration:line-through;color:#999;">${c.from}</td>
        <td style="padding:8px 12px;color:#1a202c;">→ ${c.to}</td>
      </tr>`)
        .join("");
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#1a202c;">📢 Event Updated</h2>
      <p>The event you have a ticket for has been updated by the organiser.</p>

      <h3 style="margin-top:24px;">${event.title}</h3>
      <p style="color:#555;">
        📍 ${event.location}<br/>
        🗓 ${new Date(event.startTime).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "full", timeStyle: "short" })}
      </p>

      <h4 style="margin-top:20px;">What changed:</h4>
      <table style="border-collapse:collapse;width:100%;background:#f7fafc;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#e2e8f0;">
            <th style="padding:8px 12px;text-align:left;color:#555;">Field</th>
            <th style="padding:8px 12px;text-align:left;color:#555;">Before</th>
            <th style="padding:8px 12px;text-align:left;color:#555;">After</th>
          </tr>
        </thead>
        <tbody>${changeRows}</tbody>
      </table>

      <p style="margin-top:24px;color:#555;">
        Your ticket is still valid. If you have any concerns about these changes,
        you can reach the event organiser directly at
        <a href="mailto:${creatorEmail}" style="color:#4f8ef7;">${creatorEmail}</a>.
      </p>
    </div>
  `;
    await Promise.allSettled(emails.map((to) => email_1.resend.emails.send({
        from: email_1.emailConfig.EMAIL_FROM,
        to,
        subject: `📢 Update: ${event.title} has been updated`,
        html,
    })));
};
exports.sendEventUpdatedEmail = sendEventUpdatedEmail;
const sendEventCancelledEmail = async (emails, event, creatorEmail) => {
    if (!emails.length)
        return;
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#c53030;">❌ Event Cancelled</h2>
      <p>We're sorry to let you know that the following event has been cancelled by the organiser.</p>

      <div style="background:#fff5f5;border:1px solid #feb2b2;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <h3 style="margin:0 0 8px;color:#1a202c;">${event.title}</h3>
        <p style="margin:0;color:#555;">
          📍 ${event.location}<br/>
          🗓 ${new Date(event.startTime).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "full", timeStyle: "short" })}
        </p>
      </div>

      <p style="color:#555;">
        If you paid for a ticket, please contact the organiser directly regarding a refund:
        <a href="mailto:${creatorEmail}" style="color:#4f8ef7;">${creatorEmail}</a>.
        We apologise for any inconvenience.
      </p>
    </div>
  `;
    await Promise.allSettled(emails.map((to) => email_1.resend.emails.send({
        from: email_1.emailConfig.EMAIL_FROM,
        to,
        subject: `❌ Cancelled: ${event.title}`,
        html,
    })));
};
exports.sendEventCancelledEmail = sendEventCancelledEmail;
const sendGuestTicketsEmail = async ({ to, event, tickets, reference, paymentId, }) => {
    try {
        const qrResults = await Promise.all(tickets.map(async (ticket, index) => {
            const dataUrl = await qrcode_1.default.toDataURL(ticket.qrPayload);
            const buffer = await qrcode_1.default.toBuffer(ticket.qrPayload);
            return { index, dataUrl, buffer, ticketId: ticket._id };
        }));
        const qrBlocks = qrResults
            .map((qr) => `
        <div style="margin-bottom: 20px;">
          <p><strong>Ticket ${qr.index + 1}</strong></p>
          <img src="${qr.dataUrl}" width="200" height="200" />
        </div>
      `)
            .join("");
        const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>🎉 Payment Successful</h2>

        <div style="background:#fffbeb;border:2px solid #f6c90e;border-radius:8px;padding:16px 20px;margin:16px 0;">
          <p style="margin:0;font-size:15px;"><strong>⚠️ Important: Save this email.</strong> Your ticket reference is your only way to retrieve your tickets later.</p>
          <p style="margin:8px 0 0;font-size:18px;">🔖 <strong>Reference:</strong> <code style="background:#f3f3f3;padding:4px 8px;border-radius:4px;">${reference}</code></p>
        </div>

        <p>Your payment for <strong>${event.title}</strong> was successful.</p>

        <h3>📍 Event Details</h3>
        <ul>
          <li><strong>Event:</strong> ${event.title}</li>
          <li><strong>Date & Time:</strong> ${new Date(event.startTime).toLocaleString("en-NG", {
            timeZone: "Africa/Lagos",
            dateStyle: "full",
            timeStyle: "short",
        })}</li>
          <li><strong>Location:</strong> ${event.location}</li>
        </ul>

        <h3>🎟 Your Ticket${tickets.length > 1 ? "s" : ""}</h3>
        <p>Please present the QR code(s) below at the event entrance.</p>

        ${qrBlocks}

        <p style="margin-top: 30px;color:#555;font-size:13px;">
          Can't find your tickets later? Visit the guest page and enter your email + reference to resend them.
        </p>

        <p style="margin-top: 16px;">
          See you there!<br />
          <strong>${event.title}</strong>
        </p>
      </div>
    `;
        const attachments = qrResults.map((qr) => ({
            filename: `ticket-${qr.index + 1}.png`,
            content: qr.buffer.toString("base64"),
            type: "image/png",
            disposition: "attachment",
        }));
        await email_1.resend.emails.send({
            from: email_1.emailConfig.EMAIL_FROM,
            to,
            subject: `🎟 Your ticket${tickets.length > 1 ? "s" : ""} for ${event.title}`,
            html,
            attachments,
        });
        await emailLogModel_1.EmailLog.create({
            to,
            subject: `Guest Tickets for ${event.title}`,
            eventId: event._id,
            paymentId,
            ticketIds: tickets.map((t) => t._id),
            status: "SENT",
        });
    }
    catch (error) {
        await emailLogModel_1.EmailLog.create({
            to,
            subject: `Guest Tickets for ${event.title}`,
            eventId: event._id,
            paymentId,
            ticketIds: tickets.map((t) => t._id),
            status: "FAILED",
            error: error.message,
        });
        throw error;
    }
};
exports.sendGuestTicketsEmail = sendGuestTicketsEmail;
const sendContactEmail = async ({ name, email, message, }) => {
    try {
        // Email to ME
        await email_1.resend.emails.send({
            from: email_1.emailConfig.EMAIL_FROM,
            to: email_1.emailConfig.ADMIN_EMAIL,
            subject: "📩 New Contact Message",
            html: `
      <h2>New message from your site</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
        });
        // 📩 Auto-reply to USER
        await email_1.resend.emails.send({
            from: email_1.emailConfig.EMAIL_FROM,
            to: email,
            subject: "We received your message 📩",
            html: `
      <h3>Hi ${name},</h3>
      <p>Thanks for reaching out to Eventify.</p>
      <p>We’ve received your message and will get back to you shortly.</p>
      <br/>
      <p><strong>Your message:</strong></p>
      <p>${message}</p>
    `,
        });
    }
    catch (error) {
        await emailLogModel_1.EmailLog.create({
            subject: `Contact Us Email Failed`,
            status: "FAILED",
            error: error.message,
        });
        throw error;
    }
};
exports.sendContactEmail = sendContactEmail;
