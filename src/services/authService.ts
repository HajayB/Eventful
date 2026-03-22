import { User, UserDocument } from "../models/userModel";
import { RefreshToken } from "../models/refreshModel";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken,signRefreshToken, generateResetPasswordToken, 
  verifyPasswordResetToken, verifyRefreshToken } from "../utils/jwt";
import crypto from "crypto";
import {resetPasswordEmail} from "./emailService";
//blacklist used tokens for password reset to prevent reuse
const usedResetTokens = new Set();
export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
type UserRole = "CREATOR" | "EVENTEE";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface RotateResult {
  user: UserDocument; 
  accessToken: string;
  refreshToken: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface resetInput {
  to: string;
}
interface changePasswordInput{
  userId:string;
  currentPassword:string;
  newPassword:string;
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
  await RefreshToken.create({
    tokenHash: hashToken(refreshToken),
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const userObject = user.toObject();
  const { password: _, __v, ...safeUser } = userObject;
  return {
      user: safeUser,
      accessToken,
      refreshToken
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

  await RefreshToken.create({
  tokenHash: hashToken(refreshToken),
  userId: user._id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  userAgent: "", // optional
  ipAddress: "", // optional
});
return {
  user: safeUser,
    accessToken,
    refreshToken
  };
};
export const rotateRefreshToken = async (refreshToken: string):Promise<RotateResult> => {
  const hashed = hashToken(refreshToken);

  const existingToken = await RefreshToken.findOne({ tokenHash: hashed });

  if (!existingToken) {
    throw new Error("Invalid refresh token");
  }

  if (existingToken.revokedAt) {
    await RefreshToken.updateMany(
      { userId: existingToken.userId },
      { revokedAt: new Date() }
    );
    throw new Error("Suspicious activity detected. Please login again.");
  }


  if (existingToken.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  // verify token
  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error("User not found");
  }
  console.log(user)

  const newRefreshToken = signRefreshToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  existingToken.revokedAt = new Date();
  existingToken.replacedByTokenHash = hashToken(newRefreshToken);
  await existingToken.save();

  await RefreshToken.create({
    tokenHash: hashToken(newRefreshToken),
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });


  const newAccessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken: string) => {
  const hashed = hashToken(refreshToken);

  const token = await RefreshToken.findOne({ tokenHash: hashed });

  if (!token) return;

  token.revokedAt = new Date();
  await token.save();
};

export const changePassword = async ({userId,currentPassword, newPassword}:changePasswordInput)=>{
  if(!currentPassword || !newPassword){
    throw new Error("Current and new passwords are required" );
  }

  const user = await User.findById(userId);
  if(!user){
    throw new Error("User not found");
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if(!isPasswordValid){
    throw new Error("Current password is incorrect");
  }

  if(newPassword.length <8 ){
    throw new Error("New password must be at least 8 characters long")
  }

      if (currentPassword === newPassword) {
      throw new Error("New password cannot be the same as the old password") 
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return{message:"Password changed successfully"}
}
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
  const isSame = await comparePassword(newPassword, user.password);
  if (isSame) {
    throw new Error("New password cannot be same as old password");
  }
  if(newPassword !== confirmPassword){
    throw new Error("New password and confirm password don't match")
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  usedResetTokens.add(token);

  return {Message:"Password Reset Successfully"};
}