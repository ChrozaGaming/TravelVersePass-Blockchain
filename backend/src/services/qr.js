"use strict";

const crypto = require("node:crypto");
const QRCode = require("qrcode");
const config = require("../config");

/**
 * QR token format: <destId>.<issuedAt>.<expiresAt>.<hmac>
 *
 *   - destId      : Destination ID (integer)
 *   - issuedAt    : Unix epoch seconds
 *   - expiresAt   : Unix epoch seconds (issuedAt + TTL)
 *   - hmac        : HMAC-SHA256(secret, "<destId>.<issuedAt>.<expiresAt>")
 *
 * Anti-tampering: signature wajib match HMAC server.
 * Anti-replay  : token kadaluarsa setelah TTL (default 15 menit).
 */

function sign(data) {
  return crypto
    .createHmac("sha256", config.qr.secret)
    .update(data)
    .digest("hex");
}

function generateToken(destinationId) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + config.qr.ttlSeconds;
  const data = `${destinationId}.${issuedAt}.${expiresAt}`;
  const sig = sign(data);
  return {
    token: `${data}.${sig}`,
    issuedAt,
    expiresAt,
  };
}

async function generateQRImage(destinationId) {
  const { token, issuedAt, expiresAt } = generateToken(destinationId);
  const dataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 400,
  });
  return { token, dataUrl, issuedAt, expiresAt };
}

function verifyToken(token) {
  if (typeof token !== "string" || token.length === 0) {
    return { valid: false, reason: "missing_token" };
  }

  const parts = token.split(".");
  if (parts.length !== 4) {
    return { valid: false, reason: "malformed_token" };
  }

  const [destIdStr, issuedAtStr, expiresAtStr, providedSig] = parts;
  const data = `${destIdStr}.${issuedAtStr}.${expiresAtStr}`;
  const expectedSig = sign(data);

  // Constant-time comparison to avoid timing attacks
  const a = Buffer.from(providedSig, "hex");
  const b = Buffer.from(expectedSig, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: "invalid_signature" };
  }

  const expiresAt = Number.parseInt(expiresAtStr, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Number.isNaN(expiresAt) || now > expiresAt) {
    return { valid: false, reason: "expired" };
  }

  const destinationId = Number.parseInt(destIdStr, 10);
  if (Number.isNaN(destinationId) || destinationId <= 0) {
    return { valid: false, reason: "invalid_destination" };
  }

  return { valid: true, destinationId, expiresAt };
}

module.exports = {
  generateToken,
  generateQRImage,
  verifyToken,
};
