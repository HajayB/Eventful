// src/controllers/authController.ts
import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";

/**
 * POST /auth/register
 */
export const registerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password, role } = req.body;

    const result = await registerUser({
      name,
      email,
      password,
      role,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Registration failed",
    });
  }
};

/**
 * POST /auth/login
 */
export const loginController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({
      email,
      password,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Invalid credentials",
    });
  }
};
