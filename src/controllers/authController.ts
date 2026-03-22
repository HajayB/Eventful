// src/controllers/authController.ts
import { Request, Response } from "express";
import { registerUser, loginUser, 
  rotateRefreshToken, logoutUser, 
  changePassword, resetPasswordLink,
  resetPassword} from "../services/authService";
import {cookieOptions} from "../utils/cookie"
/**
 * POST /auth/register
 */
export const registerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password, role } = req.body;

    const {user, accessToken, refreshToken} = await registerUser({
      name,
      email,
      password,
      role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("accessToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });


    res.status(201).json({message:"User registered succesffuly",user:user});
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

    const { user, accessToken, refreshToken } = await loginUser({
      email,
      password,
    });

    // 🍪 store tokens in cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // send user only
    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Invalid credentials",
    });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const result = await rotateRefreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      message: "Token refreshed successfully",
    });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    // clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId.toString();

    const result = await changePassword({
      userId: userId.toString(),
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const sendResetLinkController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    const result = await resetPasswordLink({ to: email });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const result = await resetPassword({
      token,
      newPassword,
      confirmPassword,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};