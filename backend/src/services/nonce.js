"use strict";

const crypto = require("node:crypto");

/**
 * In-memory nonce store dengan auto-expiry.
 * TTL 5 menit. Single-use (consumed after verify).
 *
 * Production note: gunakan Redis biar persist & shared antar instances.
 */

const NONCE_TTL_MS = 5 * 60 * 1000;
const nonces = new Map();

function buildMessage(wallet, nonce) {
  return (
    `Welcome to TravelVerse Pass!\n\n` +
    `Sign this message to login. This action does not cost gas.\n\n` +
    `Wallet: ${wallet.toLowerCase()}\n` +
    `Nonce: ${nonce}`
  );
}

function createNonce(wallet) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + NONCE_TTL_MS;
  nonces.set(nonce, {
    wallet: wallet.toLowerCase(),
    expiresAt,
  });
  // Auto-cleanup setelah TTL
  setTimeout(() => nonces.delete(nonce), NONCE_TTL_MS).unref?.();
  return {
    nonce,
    message: buildMessage(wallet, nonce),
    expiresAt,
  };
}

function consumeNonce(nonce, wallet) {
  const entry = nonces.get(nonce);
  if (!entry) {
    return { valid: false, reason: "unknown_nonce" };
  }
  if (Date.now() > entry.expiresAt) {
    nonces.delete(nonce);
    return { valid: false, reason: "expired" };
  }
  if (entry.wallet !== wallet.toLowerCase()) {
    return { valid: false, reason: "wallet_mismatch" };
  }
  // Single-use: hapus setelah verify
  nonces.delete(nonce);
  return { valid: true, message: buildMessage(wallet, nonce) };
}

// Test helper — DO NOT USE in production code
function _clearAll() {
  nonces.clear();
}

module.exports = {
  createNonce,
  consumeNonce,
  buildMessage,
  _clearAll,
};
