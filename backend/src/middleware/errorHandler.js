"use strict";

const config = require("../config");

/**
 * Centralized error handler. Maps known errors → HTTP status + JSON body.
 *
 * Custom error shape:
 *   err.status   : HTTP status code
 *   err.code     : machine-readable code (e.g. "NO_PASS")
 *   err.details  : optional extra info (e.g. Zod flatten output)
 */

// Mapping revert reasons dari smart contract → user-friendly response
const REVERT_MAP = {
  "already minted": {
    status: 409,
    code: "ALREADY_MINTED",
    message: "Wallet ini sudah memiliki Tourist Pass.",
  },
  "already claimed today": {
    status: 429,
    code: "ALREADY_CLAIMED",
    message: "Kamu sudah claim badge di destinasi ini hari ini.",
  },
  "user has no pass": {
    status: 400,
    code: "NO_PASS",
    message: "Mint Tourist Pass dulu sebelum check-in.",
  },
  "username required": {
    status: 400,
    code: "USERNAME_REQUIRED",
    message: "Username tidak boleh kosong.",
  },
  "username too long": {
    status: 400,
    code: "USERNAME_TOO_LONG",
    message: "Username maksimal 32 karakter.",
  },
  "insufficient pool": {
    status: 503,
    code: "REWARD_POOL_EMPTY",
    message: "Pool reward habis, hubungi admin.",
  },
  "OwnableUnauthorizedAccount": {
    status: 500,
    code: "SERVER_CONFIG_ERROR",
    message: "Server tidak punya privilege. Cek OWNER_PRIVATE_KEY.",
  },
};

function findRevertMatch(message) {
  if (!message) return null;
  for (const [key, val] of Object.entries(REVERT_MAP)) {
    if (message.includes(key)) return val;
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Already-formatted errors
  if (err.status && err.code) {
    return res.status(err.status).json({
      error: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Validation errors (lempar dari lib/validators.js)
  if (err.status === 400 && err.details) {
    return res.status(400).json({
      error: "validation_error",
      message: err.message,
      details: err.details,
    });
  }

  // Smart contract revert
  const revertReason =
    err.reason || err.shortMessage || err.message || "";
  const match = findRevertMatch(revertReason);
  if (match) {
    return res.status(match.status).json({
      error: match.code,
      message: match.message,
    });
  }

  // Generic
  console.error("[errorHandler] Unhandled:", err);
  return res.status(err.status || 500).json({
    error: "internal_error",
    message:
      config.env === "production"
        ? "Something went wrong"
        : err.message || "Unknown error",
  });
}

module.exports = errorHandler;
