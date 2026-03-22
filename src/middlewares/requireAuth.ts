import { Request, Response, NextFunction } from "express";
import { verifyAccessToken,} from "../utils/jwt";
import { rotateRefreshToken } from "../services/authService";
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
        const result = await rotateRefreshToken(refreshToken);
        user =result.user
        if (!user) return res.status(401).json({ message: 'User no longer exists' });

        // Set new cookie
        res.cookie('accessToken', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        res.cookie("refreshToken", result.refreshToken,{
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',          
        })

        decoded = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      } catch (refreshErr) {
        return res.status(401).json({ message: 'Refresh token invalid or expired' });
      }
    }
    if (!decoded) {
      return res.status(401).json({ message: "Authentication failed" });
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
    if (user.passwordChangedAt && decoded.iat) {
      const passwordChangedTime = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < passwordChangedTime) {
        return res.status(401).json({ message: 'Password changed. Please log in again.' });
      }
    }

    // req.user = user;
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }

};
