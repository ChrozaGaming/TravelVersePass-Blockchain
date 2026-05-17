"use strict";

const express = require("express");
const supabase = require("../services/supabase");
const { destinationIdSchema, validate } = require("../lib/validators");

const router = express.Router();

/**
 * GET /api/destinations
 * Response: [{ id, name, description, location_lat, location_lng, image_url }]
 *
 * List semua destinasi yang aktif. Public endpoint.
 */
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("destinations")
      .select("id, name, description, location_lat, location_lng, image_url, created_at")
      .eq("active", true)
      .order("id", { ascending: true });

    if (error) {
      const err = new Error(error.message);
      err.status = 500;
      throw err;
    }
    res.json({ destinations: data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/destinations/:id
 * Response: { id, name, ... }
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = validate(destinationIdSchema, req.params.id);

    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "not_found",
        message: `Destination ${id} not found`,
      });
    }

    res.json({ destination: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
