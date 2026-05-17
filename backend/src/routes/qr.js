"use strict";

const express = require("express");
const supabase = require("../services/supabase");
const { generateQRImage } = require("../services/qr");
const { destinationIdSchema, validate } = require("../lib/validators");

const router = express.Router();

/**
 * GET /api/destinations/:id/qr
 * Response: { token, dataUrl, issuedAt, expiresAt, destination }
 *
 * Generate QR baru untuk destinasi. Token rotating (default TTL 15 menit).
 * Endpoint ini dipanggil oleh display/tablet di lokasi setiap N menit.
 *
 * Public endpoint (no auth) — siapa saja di lokasi bisa polling QR baru.
 * Security: QR ber-HMAC, gak bisa dipalsukan.
 */
router.get("/:id/qr", async (req, res, next) => {
  try {
    const id = validate(destinationIdSchema, req.params.id);

    // Pastikan destinasi exists & aktif
    const { data: destination, error } = await supabase
      .from("destinations")
      .select("id, name, image_url")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (error || !destination) {
      return res.status(404).json({
        error: "not_found",
        message: `Destination ${id} not found or inactive`,
      });
    }

    const qr = await generateQRImage(id);

    res.json({
      destination,
      token: qr.token,
      dataUrl: qr.dataUrl,
      issuedAt: qr.issuedAt,
      expiresAt: qr.expiresAt,
      ttlSeconds: qr.expiresAt - qr.issuedAt,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
