"use strict";

const express = require("express");
const supabase = require("../services/supabase");
const blockchain = require("../services/blockchain");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/me
 * Headers: Authorization: Bearer <jwt>
 * Response: { wallet, pass, balance }
 *
 * Combined profile: pass data + token balance (langsung dari on-chain).
 */
router.get("/", authRequired, async (req, res, next) => {
  try {
    const wallet = req.user.wallet;
    const [pass, balance] = await Promise.all([
      blockchain.getPass(wallet),
      blockchain.getTokenBalance(wallet),
    ]);
    res.json({ wallet, pass, balance });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/me/badges
 * Headers: Authorization: Bearer <jwt>
 * Response: [{ tokenId, destination, mintedAt, txHash }]
 *
 * NFT badge collection user, di-enrich dengan info destinasi dari DB.
 */
router.get("/badges", authRequired, async (req, res, next) => {
  try {
    const wallet = req.user.wallet;

    // 1. Ambil semua tokenId on-chain
    const tokenIds = await blockchain.getUserBadgeIds(wallet);
    if (tokenIds.length === 0) {
      return res.json({ badges: [] });
    }

    // 2. Get badge data on-chain (parallel)
    const badgeDataList = await Promise.all(
      tokenIds.map((id) => blockchain.getBadgeData(id))
    );

    // 3. Enrich dengan info destinasi + tx hashes dari DB (parallel)
    const destIds = [...new Set(badgeDataList.map((b) => b.destinationId))];
    const [{ data: destinations }, { data: visits }] = await Promise.all([
      supabase
        .from("destinations")
        .select("id, name, image_url, location_lat, location_lng")
        .in("id", destIds),
      supabase
        .from("visits")
        .select(
          "badge_token_id, tx_hash_badge, tx_hash_visit, tx_hash_reward, tx_hash_level_up, level_after, visited_at"
        )
        .eq("user_wallet", wallet)
        .in("badge_token_id", tokenIds),
    ]);

    const destMap = new Map((destinations || []).map((d) => [d.id, d]));
    const visitMap = new Map(
      (visits || []).map((v) => [Number(v.badge_token_id), v])
    );

    const badges = badgeDataList.map((b) => {
      const visit = visitMap.get(b.tokenId);
      return {
        tokenId: b.tokenId,
        destination: destMap.get(b.destinationId) || { id: b.destinationId },
        mintedAt: b.mintedAt,
        txHashes: visit
          ? {
              badge: visit.tx_hash_badge,
              visit: visit.tx_hash_visit,
              reward: visit.tx_hash_reward,
              levelUp: visit.tx_hash_level_up,
            }
          : null,
        levelAfter: visit?.level_after ?? null,
      };
    });

    // Sort terbaru duluan
    badges.sort((a, b) => b.mintedAt.localeCompare(a.mintedAt));

    res.json({ badges });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/me/timeline
 * Headers: Authorization: Bearer <jwt>
 * Response: { timeline: { "2026": [...visits], "2025": [...] } }
 *
 * Journey timeline, di-group per tahun. Sumber: DB visits + enrich destinasi.
 */
router.get("/timeline", authRequired, async (req, res, next) => {
  try {
    const wallet = req.user.wallet;

    const { data: visits, error } = await supabase
      .from("visits")
      .select(`
        id,
        destination_id,
        visited_at,
        badge_token_id,
        tx_hash_badge,
        level_after,
        destinations ( id, name, image_url )
      `)
      .eq("user_wallet", wallet)
      .order("visited_at", { ascending: false });

    if (error) {
      const err2 = new Error(error.message);
      err2.status = 500;
      throw err2;
    }

    // Group by year
    const timeline = {};
    for (const v of visits || []) {
      const year = new Date(v.visited_at).getFullYear();
      if (!timeline[year]) timeline[year] = [];
      timeline[year].push({
        id: v.id,
        destination: v.destinations,
        visitedAt: v.visited_at,
        badgeTokenId: v.badge_token_id,
        txHash: v.tx_hash_badge,
        levelAfter: v.level_after,
      });
    }

    res.json({ timeline });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
