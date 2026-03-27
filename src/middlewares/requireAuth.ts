import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/userModel";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let decoded: any;

    try {
      decoded = verifyAccessToken(accessToken);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return res.status(401).json({ message: "Access token invalid" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat) {
      const passwordChangedTime = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < passwordChangedTime) {
        return res.status(401).json({ message: "Password changed. Please log in again." });
      }
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
