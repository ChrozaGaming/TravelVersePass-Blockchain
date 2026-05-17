"use strict";

const express = require("express");
const { ethers } = require("ethers");
const { authNonceSchema, validate } = require("../lib/validators");
const { createNonce, consumeNonce } = require("../services/nonce");
const { signToken } = require("../services/jwt");
const { authRequired } = require("../middleware/auth");
const config = require("../config");

const router = express.Router();

/**
 * POST /api/auth/nonce
 * Body: { wallet }
 * Response: { nonce, message, expiresAt }
 *
 * Step 1 of wallet-signature login.
 * FE minta nonce, lalu user `signMessage(message)` lewat MetaMask.
 */
router.post("/nonce", (req, res, next) => {
  try {
    const { wallet } = validate(authNonceSchema, req.body);
    const { nonce, message, expiresAt } = createNonce(wallet);
    res.json({ nonce, message, expiresAt });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/verify
 * Body: { wallet, signature, nonce }
 * Response: { token, wallet, expiresIn }
 *
 * Step 2: verify signature dengan ethers.verifyMessage, terbitkan JWT.
 */
router.post("/verify", (req, res, next) => {
  try {
    const { wallet, signature, nonce } = req.body || {};

    if (!wallet || !signature || !nonce) {
      return res.status(400).json({
        error: "validation_error",
        message: "wallet, signature, nonce wajib diisi",
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({
        error: "validation_error",
        message: "Invalid wallet address format",
      });
    }

    // Consume nonce (single-use, anti-replay)
    const nonceCheck = consumeNonce(nonce, wallet);
    if (!nonceCheck.valid) {
      return res.status(401).json({
        error: "invalid_nonce",
        message: nonceCheck.reason,
      });
    }

    // Verify signature dengan pesan yang kita kontrol server-side
    let recovered;
    try {
      recovered = ethers.verifyMessage(nonceCheck.message, signature);
    } catch {
      return res.status(401).json({
        error: "invalid_signature",
        message: "Cannot recover signer from signature",
      });
    }

    if (recovered.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(401).json({
        error: "invalid_signature",
        message: "Signature does not match wallet",
      });
    }

    const token = signToken(wallet);
    res.json({
      token,
      wallet: wallet.toLowerCase(),
      expiresIn: config.auth.jwtExpiresIn,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Headers: Authorization: Bearer <jwt>
 * Response: { wallet }
 */
router.get("/me", authRequired, (req, res) => {
  res.json({ wallet: req.user.wallet });
});

module.exports = router;
