"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketsEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const qrcode_1 = __importDefault(require("qrcode"));
const email_1 = require("../config/email");
const emailLogModel_1 = require("../models/emailLogModel");
const sendTicketsEmail = async ({ to, event, tickets, paymentId, }) => {
    const transporter = nodemailer_1.default.createTransport({
        host: email_1.emailConfig.host,
        port: email_1.emailConfig.port,
        secure: false,
        family: 4,
        auth: {
            user: email_1.emailConfig.user,
            pass: email_1.emailConfig.pass,
        },
    });
    try {
        // 1️⃣ Generate QR images (both inline + attachments)
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
        // 4️⃣ Attach QR images
        const attachments = qrResults.map((qr) => ({
            filename: `ticket-${qr.index + 1}.png`,
            content: qr.buffer,
            contentType: "image/png",
        }));
        // 5️⃣ Send email
        await transporter.sendMail({
            from: `"${event.title}" <${email_1.emailConfig.from}>`,
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
