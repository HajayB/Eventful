import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
  userId: string;
  email:string;
  role: "CREATOR" | "EVENTEE";
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.jwt.secret
    ) as JwtPayload;

    req.user = {
      userId: decoded.userId as any,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
