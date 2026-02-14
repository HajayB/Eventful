"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const userModel_1 = require("../models/userModel");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const registerUser = async ({ name, email, password, role = "EVENTEE", }) => {
    // 1. Check if user already exists
    const existingUser = await userModel_1.User.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists");
    }
    // 2. Hash password
    const hashedPassword = await (0, password_1.hashPassword)(password);
    // 3. Create user
    const user = await userModel_1.User.create({
        name,
        email,
        password: hashedPassword,
        role,
    });
    // 4. Generate token
    const token = (0, jwt_1.signToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const userObject = user.toObject();
    const { password: _, __v, ...safeUser } = userObject;
    return {
        user: safeUser,
        token,
    };
};
exports.registerUser = registerUser;
const loginUser = async ({ email, password, }) => {
    // 1. Find user
    const user = await userModel_1.User.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    // 2. Compare password
    const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }
    // 3. Generate token
    const token = (0, jwt_1.signToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const userObject = user.toObject();
    const { password: _, __v, ...safeUser } = userObject;
    return {
        user: safeUser,
        token,
    };
};
exports.loginUser = loginUser;
