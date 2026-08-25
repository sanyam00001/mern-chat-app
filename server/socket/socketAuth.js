const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, pair) => {
    const separatorIndex = pair.indexOf("=");

    if (separatorIndex === -1) {
      return cookies;
    }

    const key = pair.slice(0, separatorIndex).trim();
    const value = decodeURIComponent(pair.slice(separatorIndex + 1).trim());

    if (key) {
      cookies[key] = value;
    }

    return cookies;
  }, {});
};

const authenticateSocket = async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie || "");
    const token = cookies.jwt;

    if (!token) {
      return next(new Error("Not authorized, no token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("Not authorized, user not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Not authorized, token failed"));
  }
};

module.exports = {
  authenticateSocket,
};
