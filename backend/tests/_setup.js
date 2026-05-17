"use strict";

// Set required env vars BEFORE any module that depends on config loads.
// File ini di-require di awal setiap test file.

process.env.NODE_ENV = "test";
process.env.PORT = "0";
process.env.CORS_ORIGIN = "http://localhost:3000";

// Blockchain (fake values - cukup untuk lulus config validation)
process.env.AMOY_RPC_URL = "http://localhost:8545";
process.env.OWNER_PRIVATE_KEY =
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.TOURIST_PASS_ADDRESS = "0x0000000000000000000000000000000000000001";
process.env.BADGE_ADDRESS = "0x0000000000000000000000000000000000000002";
process.env.TOKEN_ADDRESS = "0x0000000000000000000000000000000000000003";

// Auth
process.env.JWT_SECRET = "test-jwt-secret-for-unit-tests-only-do-not-use";
process.env.JWT_EXPIRES_IN = "1h";

// QR
process.env.QR_SECRET = "test-qr-secret-for-unit-tests-only-do-not-use";
process.env.QR_TTL_SECONDS = "900";

// Supabase (fake — kita gak panggil DB di unit tests)
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service-role-key";
