"use strict";

require("./_setup");

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const { generateToken, verifyToken } = require("../src/services/qr");

describe("QR Service", () => {
  describe("generateToken", () => {
    test("generates token dengan format <destId>.<iat>.<exp>.<sig>", () => {
      const { token } = generateToken(42);
      const parts = token.split(".");
      assert.equal(parts.length, 4, "Token harus punya 4 parts");
      assert.equal(parts[0], "42", "Part pertama = destinationId");
    });

    test("issuedAt < expiresAt", () => {
      const { issuedAt, expiresAt } = generateToken(1);
      assert.ok(expiresAt > issuedAt, "expiresAt harus > issuedAt");
    });

    test("expiresAt = issuedAt + 900 detik (default TTL)", () => {
      const { issuedAt, expiresAt } = generateToken(1);
      assert.equal(expiresAt - issuedAt, 900);
    });
  });

  describe("verifyToken — happy path", () => {
    test("verify fresh token returns valid", () => {
      const { token } = generateToken(1);
      const result = verifyToken(token);
      assert.equal(result.valid, true);
      assert.equal(result.destinationId, 1);
    });

    test("preserves destinationId", () => {
      const { token } = generateToken(999);
      const result = verifyToken(token);
      assert.equal(result.destinationId, 999);
    });
  });

  describe("verifyToken — security", () => {
    test("rejects token dengan tampered destinationId", () => {
      const { token } = generateToken(1);
      // Ganti destId di awal — sig jadi invalid
      const tampered = "2" + token.slice(1);
      const result = verifyToken(tampered);
      assert.equal(result.valid, false);
      assert.equal(result.reason, "invalid_signature");
    });

    test("rejects token dengan tampered signature", () => {
      const { token } = generateToken(1);
      // Flip last char
      const tampered = token.slice(0, -1) + (token.slice(-1) === "0" ? "1" : "0");
      const result = verifyToken(tampered);
      assert.equal(result.valid, false);
      assert.equal(result.reason, "invalid_signature");
    });

    test("rejects malformed token (kurang dari 4 parts)", () => {
      const result = verifyToken("just.three.parts");
      assert.equal(result.valid, false);
      assert.equal(result.reason, "malformed_token");
    });

    test("rejects empty/null token", () => {
      assert.equal(verifyToken("").valid, false);
      assert.equal(verifyToken(null).valid, false);
      assert.equal(verifyToken(undefined).valid, false);
    });

    test("rejects token yang expired", () => {
      // Bikin token manual dengan expiry di masa lalu
      const crypto = require("node:crypto");
      const past = Math.floor(Date.now() / 1000) - 100;
      const data = `1.${past - 900}.${past}`;
      const sig = crypto
        .createHmac("sha256", process.env.QR_SECRET)
        .update(data)
        .digest("hex");
      const expiredToken = `${data}.${sig}`;
      const result = verifyToken(expiredToken);
      assert.equal(result.valid, false);
      assert.equal(result.reason, "expired");
    });
  });
});
