"use strict";

require("dotenv").config();

function required(name) {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`[config] Missing required env var: ${name}`);
  }
  return v;
}

function optional(name, fallback) {
  const v = process.env[name];
  return v && v.trim() !== "" ? v : fallback;
}

const config = {
  env: optional("NODE_ENV", "development"),
  port: Number.parseInt(optional("PORT", "4000"), 10),
  corsOrigin: optional("CORS_ORIGIN", "http://localhost:3000"),

  blockchain: {
    rpcUrl: optional(
      "RPC_URL",
      optional("AMOY_RPC_URL", "https://rpc-amoy.polygon.technology/")
    ),
    ownerPrivateKey: required("OWNER_PRIVATE_KEY"),
    chainId: Number.parseInt(optional("CHAIN_ID", "80002"), 10),
    contracts: {
      touristPass: required("TOURIST_PASS_ADDRESS"),
      badge: required("BADGE_ADDRESS"),
      token: required("TOKEN_ADDRESS"),
    },
  },

  auth: {
    jwtSecret: required("JWT_SECRET"),
    jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
  },

  qr: {
    secret: required("QR_SECRET"),
    ttlSeconds: Number.parseInt(optional("QR_TTL_SECONDS", "900"), 10),
  },

  supabase: {
    url: required("SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  },
};

module.exports = config;
