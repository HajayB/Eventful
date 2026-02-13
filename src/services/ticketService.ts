// src/services/ticketService.ts
import { Types } from "mongoose";

import { Ticket } from "../models/ticketModel";
import { Event } from "../models/eventModel";
import crypto from "crypto";

interface IssueTicketsInput {
  eventId: string;
  eventeeId: string;
  quantity: number;
  paymentRef: string; // string, not ObjectId
}

export const issueTicketsAfterPayment = async ({
  eventId,
  eventeeId,
  quantity,
  paymentRef,
}: IssueTicketsInput) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  //return existing tickets if already issued
  const existingTickets = await Ticket.find({ paymentRef });
  if (existingTickets.length > 0) {
    return existingTickets;
  }

  //Create tickets
  const tickets = Array.from({ length: quantity }).map(() => ({
    eventId: new Types.ObjectId(eventId),
    eventeeId: new Types.ObjectId(eventeeId),
    paymentRef,
    qrPayload: generateQrPayload(),
    isScanned: false,
  }));

  const createdTickets = await Ticket.insertMany(tickets);

  //Update tickets sold ONCE
  event.ticketsSold += quantity;
  await event.save();

  return createdTickets;
};




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
  // 1. Find ticket
  const ticket = await Ticket.findOne({ qrPayload });
  if (!ticket) {
    throw new Error("Invalid ticket");
  }

  // 2. Check event match
  if (ticket.eventId.toString() !== eventId) {
    throw new Error("Ticket does not belong to this event");
  }

  // 3. Ensure event belongs to creator
  const event = await Event.findById(eventId);
  if (!event || event.creatorId.toString() !== creatorId) {
    throw new Error("Unauthorized to scan this ticket");
  }

  // 4. Check if already scanned
  if (ticket.isScanned) {
    throw new Error("Ticket already scanned");
  }

  // 5. Mark as scanned
  ticket.isScanned = true;
  ticket.scannedAt = new Date();
  await ticket.save();

  return ticket;
};

const generateQrPayload = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

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

  if (status === "used") {
    query.isScanned = true;
  }

  if (status === "unused") {
    query.isScanned = false;
  }

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


