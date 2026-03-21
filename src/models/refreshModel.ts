import mongoose, { Schema, Document, Types } from "mongoose";

interface RefreshTokenDocument extends Document {
  tokenHash: string;
  replacedByTokenHash?: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  revokedAt?: Date;
  apiKeyId?: Types.ObjectId;
  userAgent?: string;
  ipAddress?: string;

  isExpired: boolean;
  isActive: boolean;
}
const RefreshSchema = new Schema<RefreshTokenDocument>({
    tokenHash: {
        type: String,
        required: true,
        index:true,
    },
    replacedByTokenHash:{
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index:true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index:true,
    },
    revokedAt: {
        type: Date,
    },
    apiKeyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey',
    },
    userAgent: {
        type: String,
    },
    ipAddress: {
        type: String,
    },

}, { timestamps: true });

RefreshSchema.virtual("isExpired").get(function (this: RefreshTokenDocument) {
  return Date.now() >= this.expiresAt.getTime();
});

RefreshSchema.virtual("isActive").get(function (this: RefreshTokenDocument) {
  return !this.revokedAt && !this.isExpired;
});
export const Refresh = mongoose.model<RefreshTokenDocument>(
  "Payment",
  RefreshSchema
);