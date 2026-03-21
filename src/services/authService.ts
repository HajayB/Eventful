import { User } from "../models/userModel";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken,signRefreshToken, generateResetPasswordToken, verifyPasswordResetToken } from "../utils/jwt";
import crypto from "crypto";
import {resetPasswordEmail} from "./emailService";
//blacklist used tokens for password reset to prevent reuse
const usedResetTokens = new Set();

//helper for refresh token hashing
const hashToken = (token:any) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

type UserRole = "CREATOR" | "EVENTEE";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface resetInput {
  to: string;
}

interface Payload{
  email:string,
  userId:string,
}
interface ResetPasswordInput{
  token:string;
  newPassword:string;
  confirmPassword:string;
}
export const registerUser = async ({
  name,
  email,
  password,
  role = "EVENTEE",
}: RegisterInput) => {
  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // 2. Hash password
  const hashedPassword = await hashPassword(password);

  // 3. Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  // 4. Generate token
  const token = signAccessToken({
    userId: user._id.toString(),
    email:user.email,
    role: user.role,
  });
  const userObject = user.toObject();
  const { password: _, __v, ...safeUser } = userObject;
  return {
      user: safeUser,
      token,
  };
};

export const loginUser = async ({
  email,
  password,
}: LoginInput) => {
  // 1. Find user
  const user = await User.findOne({ email }) ;
  if (!user) {
    throw new Error("Invalid credentials");
  }  

  // 2. Compare password
  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // 3. Generate token
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    email:user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    email:user.email,
    role: user.role,
  })

  const userObject = user.toObject();
  const { password: _, __v, ...safeUser } = userObject;

return {
  user: safeUser,
    accessToken,
    refreshToken
  };
};

export const resetPasswordLink = async({to}:resetInput)=>{
// to is email address
  const user = await User.findOne({email:to});
  if (!user) {
      return { message: "If this email exists, a reset link has been sent" };
  }
  const token = generateResetPasswordToken({userId:user._id.toString(),email:user.email});
  await resetPasswordEmail({to,token})
  return{message:"Reset email sent"}
}

export const resetPassword = async ({token, newPassword, confirmPassword}:ResetPasswordInput)=>{
  if(!token){
    throw new Error("Invalid or missing token");
  }

  if(usedResetTokens.has(token)){
    throw new Error("Token has already been used")
  }

  const payload = verifyPasswordResetToken(token) as Payload;
  if(!payload || !payload.email){
    throw new Error("Token expired or invalid")
  }
  const email = payload.email;
  if(!newPassword || !confirmPassword){
    throw new Error("New password and confirmPassword are required")
  }
  if(newPassword.length < 8){
    throw new Error("Password is below 8 characters")
  }
  const user = await User.findOne({email});

  if(!user){
    throw new Error("User does not exist")
  }
  if(newPassword !== confirmPassword){
    throw new Error("New password and confirm password don't match")
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  usedResetTokens.add(token);

  return ({Message:"Password Reset Successfully"});
}