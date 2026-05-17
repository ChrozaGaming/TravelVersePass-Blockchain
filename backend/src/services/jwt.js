"use strict";

const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Sign JWT untuk user yang sudah verify wallet signature.
 * Payload: { wallet: address (lowercase) }
 */
function signToken(wallet) {
  return jwt.sign(
    { wallet: wallet.toLowerCase() },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
}

/**
 * Verify JWT dan return payload, atau throw error.
 */
function verifyToken(token) {
  return jwt.verify(token, config.auth.jwtSecret);
}

module.exports = { signToken, verifyToken };
