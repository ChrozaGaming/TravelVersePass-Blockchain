"use strict";

const express = require("express");

const authRoutes = require("./auth");
const destinationRoutes = require("./destinations");
const qrRoutes = require("./qr");
const checkinRoutes = require("./checkin");
const meRoutes = require("./me");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/destinations", destinationRoutes);
router.use("/destinations", qrRoutes); // mounts /destinations/:id/qr
router.use("/checkin", checkinRoutes);
router.use("/me", meRoutes);

module.exports = router;
