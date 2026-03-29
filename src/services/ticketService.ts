// src/services/ticketService.ts
import mongoose, { Types } from "mongoose";

import { Ticket } from "../models/ticketModel";
import { Event } from "../models/eventModel";
import crypto from "crypto";

interface IssueTicketsInput {
  eventId: string;
  eventeeId: string | null;
  quantity: number;
  paymentRef: string;
}
//TICKET CREATION
export const issueTicketsAfterPayment = async ({
  eventId,
  eventeeId,
  quantity,
  paymentRef,
}: IssueTicketsInput) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
     //FIND EVENT 
      const event = await Event.findById(eventId).session(session);
      if (!event) throw new Error("Event not found");

      // IDEMPOTENCY 
      const existingTickets = await Ticket.find({ paymentRef }).session(session);

      if (existingTickets.length === quantity) {
        return existingTickets;
      }

     // CAPACITY CHECK 
      if (event.ticketsSold + quantity > event.totalTickets) {
        throw new Error("Not enough tickets available");
      }

      // CREATE TICKETS 
      const ticketsPayload = Array.from({ length: quantity }).map(() => ({
        eventId: new Types.ObjectId(eventId),
        eventeeId: eventeeId ? new Types.ObjectId(eventeeId) : null,
        paymentRef,
        qrPayload: generateQrPayload(),
        isScanned: false,
      }));

      const createdTickets = await Ticket.insertMany(ticketsPayload, { session });

      // UPDATE EVENT 
      event.ticketsSold += quantity;
      await event.save({ session });

      return createdTickets;
    });
  } finally {
    session.endSession();
  }
};

// SCAN TICKET SERVICE

interface ScanTicketInput {
  qrPayload: string;
  eventId: string;
  creatorId: string;
}

export const scanTicket = async ({
  qrPayload,
  eventId,
  creatorId,
}: ScanTicketInput) => {
// FIND TICKET + EVENT 
  const ticket = await Ticket.findOne({ qrPayload }).populate("eventId");

  if (!ticket) throw new Error("Invalid ticket");

  const event = ticket.eventId as any;

// VALIDATIONS 

  if (event._id.toString() !== eventId) {
    throw new Error("Ticket does not belong to this event");
  }

  if (event.creatorId.toString() !== creatorId) {
    throw new Error("Unauthorized to scan this ticket");
  }

  if (ticket.isScanned) {
    throw new Error("Ticket already scanned");
  }

  /* -------- UPDATE -------- */
  ticket.isScanned = true;
  ticket.scannedAt = new Date();

  await ticket.save();

  return {
    id: ticket._id,
    eventId: ticket.eventId,
    scannedAt: ticket.scannedAt,
  };
};

/* ============================================================
   GET EVENTEE TICKETS
============================================================ */

interface GetEventeeTicketsInput {
  eventeeId: string;
  status?: "used" | "unused";
}

export const getEventeeTickets = async ({
  eventeeId,
  status,
}: GetEventeeTicketsInput) => {
  const query: any = {
    eventeeId: new Types.ObjectId(eventeeId),
  };

  if (status === "used") query.isScanned = true;
  if (status === "unused") query.isScanned = false;

  const tickets = await Ticket.find(
    query,
    {
      _id: 1,
      paymentRef: 1,
      createdAt: 1,
      isScanned: 1,
      eventId: 1,
    }
  )
    .populate({
      path: "eventId",
      select: "title location startTime endTime price",
    })
    .sort({ createdAt: -1 })
    .lean();

  return tickets.map((ticket) => ({
    ...ticket,
    status: ticket.isScanned ? "USED" : "UNUSED",
    hasQr: !ticket.isScanned,
  }));
};

/* ============================================================
   QR GENERATOR
============================================================ */

const generateQrPayload = (): string => {
  return crypto.randomBytes(32).toString("hex");
};