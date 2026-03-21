import QRCode from "qrcode";
import { EventDocument } from "../models/eventModel";
import { TicketDocument } from "../models/ticketModel";
import { resend, emailConfig } from "../config/email";
import { EmailLog } from "../models/emailLogModel";

interface SendTicketsEmailInput {
  to: string;
  event: EventDocument;
  tickets: TicketDocument[];
  paymentId?: string;
  token:string;
}
interface SendResetEmail{
  to:string,
  token:string,
}
export const resetPasswordEmail = async ({to, token}:SendResetEmail) => {
  const resetLink = `${emailConfig.appUrl}/api/auth/reset-password?token=${token}`;
 
  try {
    await resend.emails.send({
      from: emailConfig.EMAIL_FROM,
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
  } catch (err) {
    console.error("Resend Email Error:", err);
    throw new Error("Could not send password reset email");
  }
};

export const sendTicketsEmail = async ({
  to,
  event,
  tickets,
  paymentId,
}: SendTicketsEmailInput) => {
  try {
    // 1️⃣ Generate QR codes (data URL for inline + buffer for attachments)
    const qrResults = await Promise.all(
      tickets.map(async (ticket, index) => {
        const dataUrl = await QRCode.toDataURL(ticket.qrPayload);
        const buffer = await QRCode.toBuffer(ticket.qrPayload);

        return {
          index,
          dataUrl,
          buffer,
          ticketId: ticket._id,
        };
      })
    );

    // 2️⃣ Inline QR HTML
    const qrBlocks = qrResults
      .map(
        (qr) => `
        <div style="margin-bottom: 20px;">
          <p><strong>Ticket ${qr.index + 1}</strong></p>
          <img src="${qr.dataUrl}" width="200" height="200" />
        </div>
      `
      )
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
          <li><strong>Date & Time:</strong> ${new Date(event.startTime).toLocaleString(
            "en-NG",
            {
              timeZone: "Africa/Lagos",
              dateStyle: "full",
              timeStyle: "short",
            }
          )}</li>
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
    await resend.emails.send({
      from: emailConfig.EMAIL_FROM,
      to,
      subject: `🎟 Your ticket${tickets.length > 1 ? "s" : ""} for ${event.title}`,
      html,
      attachments,
    });

    // 6️⃣ Log success
    await EmailLog.create({
      to,
      subject: `Tickets for ${event.title}`,
      eventId: event._id,
      paymentId,
      ticketIds: tickets.map((t) => t._id),
      status: "SENT",
    });
  } catch (error: any) {
    // 7️⃣ Log failure
    await EmailLog.create({
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

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export const sendContactEmail = async ({
  name,
  email,
  message,
}: ContactPayload) => {

  try{
    // Email to ME
  await resend.emails.send({
    from:emailConfig.EMAIL_FROM, 
    to: emailConfig.ADMIN_EMAIL,
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
  await resend.emails.send({
    from: emailConfig.EMAIL_FROM,
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

  }catch(error:any){
    await EmailLog.create({
      subject: `Contact Us Email Failed`,
      status: "FAILED",
      error: error.message,
    });

    throw error;
  }

};