import { Types } from "mongoose";
import { Payment } from "../models/paymentModel";

export const getUserPaymentHistory = async (userId: string) => {
  const payments = await Payment.find(
    { userId: new Types.ObjectId(userId) },
    { __v: 0 }
  )
    .populate({
      path: "eventId",
      select: "title location startTime",
    })
    .sort({ createdAt: -1 })
    .lean();

  return payments.map((p) => ({
    _id: p._id,
    amount: p.amount,
    quantity: p.quantity,
    reference: p.reference,
    status: p.status,
    paidAt: p.createdAt,
    event: {
      _id: (p.eventId as any)?._id,
      title: (p.eventId as any)?.title,
      location: (p.eventId as any)?.location,
      startTime: (p.eventId as any)?.startTime,
    },
  }));
};
