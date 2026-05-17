"use strict";

const express = require("express");
const supabase = require("../services/supabase");
const { verifyToken: verifyQR } = require("../services/qr");
const { processCheckin, canClaimToday } = require("../services/blockchain");
const { authRequired } = require("../middleware/auth");
const { checkinSchema, validate } = require("../lib/validators");

const router = express.Router();

/**
 * POST /api/checkin
 * Headers: Authorization: Bearer <jwt>
 * Body: { qrToken }
 * Response: { success, badge, levelUp?, reward, txHashes }
 *
 * Full check-in flow:
 *   1. Verify QR token (HMAC signature + expiry)
 *   2. Verify destination exists di DB
 *   3. Pre-check user belum claim hari ini (avoid wasting gas)
 *   4. Orchestrate on-chain: mintBadge → incrementVisit → rewardCheckin
 *   5. Optional: rewardLevelUp kalau LevelUp event ter-emit
 *   6. Record visit ke DB
 */
router.post("/", authRequired, async (req, res, next) => {
  try {
    const { qrToken } = validate(checkinSchema, req.body);
    const wallet = req.user.wallet;

    // 1. Verify QR
    const qrResult = verifyQR(qrToken);
    if (!qrResult.valid) {
      return res.status(400).json({
        error: "invalid_qr",
        message: `QR tidak valid: ${qrResult.reason}`,
      });
    }
    const { destinationId } = qrResult;

    // 2. Verify destination in DB
    const { data: destination, error: destErr } = await supabase
      .from("destinations")
      .select("id, name")
      .eq("id", destinationId)
      .eq("active", true)
      .single();

    if (destErr || !destination) {
      return res.status(404).json({
        error: "destination_not_found",
        message: "Destinasi tidak ditemukan atau tidak aktif",
      });
    }

    // 3. Pre-check on-chain (anti-gas-waste)
    const canClaim = await canClaimToday(wallet, destinationId);
    if (!canClaim) {
      return res.status(429).json({
        error: "ALREADY_CLAIMED",
        message: "Kamu sudah claim badge di destinasi ini hari ini.",
      });
    }

    // 4-5. Orchestrate on-chain
    const result = await processCheckin(wallet, destinationId);

    // 6. Record di DB (non-blocking - kalau gagal, tx udah on-chain)
    try {
      await supabase.from("visits").insert({
        user_wallet: wallet,
        destination_id: destinationId,
        badge_token_id: result.badgeTokenId,
        tx_hash_badge: result.txHashes.badge,
        tx_hash_visit: result.txHashes.visit,
        tx_hash_reward: result.txHashes.reward,
        tx_hash_level_up: result.txHashes.levelUpBonus,
        level_after: result.levelUp ? result.levelUp.newLevel : null,
      });
    } catch (dbErr) {
      // Log tapi jangan fail response — tx udah on-chain
      console.error("[checkin] DB record failed:", dbErr);
    }

    res.json({
      success: true,
      destination: {
        id: destination.id,
        name: destination.name,
      },
      badge: {
        tokenId: result.badgeTokenId,
        destinationId,
      },
      reward: {
        checkin: "10.0",
        levelUpBonus: result.levelUp ? "200.0" : null,
      },
      levelUp: result.levelUp,
      txHashes: result.txHashes,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
