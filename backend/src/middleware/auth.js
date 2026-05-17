"use strict";

const { verifyToken } = require("../services/jwt");

/**
 * Express middleware: validate Authorization: Bearer <jwt>.
 * Attaches `req.user = { wallet }` on success.
 */
function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Missing Bearer token",
    });
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyToken(token);
    req.user = { wallet: payload.wallet };
    next();
  } catch (err) {
    return res.status(401).json({
      error: "unauthorized",
      message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
}

module.exports = { authRequired };
