const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utils/validateAuth");

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  validateRegisterInput({ name, email, password });

  const userExists = await User.findOne({ email: email.trim().toLowerCase() });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  generateToken(res, user._id);

  res.status(201).json(formatUserResponse(user));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateLoginInput({ email, password });

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  generateToken(res, user._id);

  res.status(200).json(formatUserResponse(user));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(formatUserResponse(req.user));
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};
