import { Request, Response, NextFunction } from "express";
import {signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken} from "../utils/jwt";
import {env} from "../config/env";
import { User } from "../models/userModel";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let decoded:any;
    let user:any;

    // -----------------------------
    // 1️⃣ Try access token first
    // -----------------------------
    if (accessToken) {
      try {
        decoded = verifyAccessToken(accessToken);
      } catch (err:any) {
        if (err.name !== 'TokenExpiredError') {
          return res.status(401).json({ message: 'Access token invalid' });
        }
        // If Expired, will try refresh token
      }
    }

        // -----------------------------
    // 2️⃣ Check refresh token if access token expired or missing
    // -----------------------------
    if (!decoded && refreshToken) {
      try {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        user = await User.findById(refreshDecoded.userId);
        if (!user) return res.status(401).json({ message: 'User no longer exists' });

        // Issue new access token
        const newAccessToken = signAccessToken({
          userId: user._id,
          email: user.email,
          role: user.role,
        })
        // Set new cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        decoded = {
          userId: user._id,
          email: user.email,
          role: user.role,
        };
      } catch (refreshErr) {
        return res.status(401).json({ message: 'Refresh token invalid or expired' });
      }
    }
      // -----------------------------
    // 3️⃣ Get user if not already fetched
    // -----------------------------
    if (!user) {
      user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ message: 'User no longer exists' });
    }

    // -----------------------------
    // 4️⃣ Check password changed
    // -----------------------------
    if (user.passwordChangedAt) {
      const passwordChangedTime = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < passwordChangedTime) {
        return res.status(401).json({ message: 'Password changed. Please log in again.' });
      }
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }

};
