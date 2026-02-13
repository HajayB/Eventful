import { getEventeeTickets } from "../services/ticketService";
import { Ticket } from "../models/ticketModel";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { scanTicket } from "../services/ticketService";

/**
 * CREATOR: Scan / verify ticket (QR)
 * POST /tickets/scan
 */
export const scanTicketController = async (
    req: Request,
    res: Response
  ) => {
    try {
      const creatorId = req.user!.userId.toString();
      const { qrPayload, eventId } = req.body;
  
      if (!qrPayload || !eventId) {
        return res.status(400).json({
          valid: false,
          message: "qrPayload and eventId are required",
        });
      }
  
      const ticket = await scanTicket({
        qrPayload,
        eventId,
        creatorId,
      });
  
      res.status(200).json({
        valid: true,
        status: "USED",
        message: "Ticket is valid and has been verified",
        ticketId: ticket._id,
        scannedAt: ticket.scannedAt,
      });
    } catch (error: any) {
      res.status(400).json({
        valid: false,
        message: error.message || "Invalid ticket",
      });
    }
  };
  

/**
 * EVENTEE: View my tickets
 * GET /tickets/me?status=used|unused
 */
export const getMyTicketsController = async (
  req: Request,
  res: Response
) => {
  try {
    const eventeeId = req.user!.userId.toString();
    const { status } = req.query;

    if (status && status !== "used" && status !== "unused") {
      return res.status(400).json({
        message: "Invalid status filter",
      });
    }

    const tickets = await getEventeeTickets({
      eventeeId,
      status: status as "used" | "unused" | undefined,
    });

    const response = tickets.map((ticket) => ({
      ...ticket,
      status: ticket.isScanned ? "USED" : "UNUSED",
      hasQr: !ticket.isScanned,
    }));

    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to fetch tickets",
    });
  }
};


export const getTicketQrController = async (
  req: Request,
  res: Response
) => {
  const eventeeId = req.user!.userId;
  const ticketId  = req.params.ticketId as string;

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  const ticket = await Ticket.findOne({
    _id: ticketId,
    eventeeId, // 🔐 ensures ownership
  }).select("qrPayload isScanned");

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (ticket.isScanned) {
    return res.status(400).json({
      message: "Ticket already used",
    });
  }

  return res.json({
    qrPayload: ticket.qrPayload,
  });
};

