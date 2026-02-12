import { User } from "../models/userModel";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";

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
  const token = signToken({
    userId: user._id.toString(),
    email:user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

export const loginUser = async ({
  email,
  password,
}: LoginInput) => {
  // 1. Find user
  const user = await User.findOne({ email });
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
  const token = signToken({
    userId: user._id.toString(),
    email:user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};