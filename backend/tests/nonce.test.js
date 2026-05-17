"use strict";

require("./_setup");

const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const {
  createNonce,
  consumeNonce,
  buildMessage,
  _clearAll,
} = require("../src/services/nonce");

describe("Nonce Service", () => {
  const wallet = "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01";

  beforeEach(() => {
    _clearAll();
  });

  test("createNonce returns nonce, message, expiresAt", () => {
    const r = createNonce(wallet);
    assert.equal(typeof r.nonce, "string");
    assert.equal(r.nonce.length, 32, "Nonce harus 16 byte hex = 32 chars");
    assert.equal(typeof r.message, "string");
    assert.ok(r.message.includes(r.nonce));
    assert.ok(r.message.includes(wallet.toLowerCase()));
    assert.ok(r.expiresAt > Date.now());
  });

  test("consumeNonce returns valid untuk wallet yang match", () => {
    const { nonce } = createNonce(wallet);
    const r = consumeNonce(nonce, wallet);
    assert.equal(r.valid, true);
    assert.ok(r.message.includes(nonce));
  });

  test("consumeNonce case-insensitive untuk wallet", () => {
    const { nonce } = createNonce(wallet);
    const r = consumeNonce(nonce, wallet.toUpperCase());
    assert.equal(r.valid, true);
  });

  test("consumeNonce rejects unknown nonce", () => {
    const r = consumeNonce("nonexistent-nonce", wallet);
    assert.equal(r.valid, false);
    assert.equal(r.reason, "unknown_nonce");
  });

  test("consumeNonce rejects wallet mismatch", () => {
    const { nonce } = createNonce(wallet);
    const r = consumeNonce(
      nonce,
      "0x1111111111111111111111111111111111111111"
    );
    assert.equal(r.valid, false);
    assert.equal(r.reason, "wallet_mismatch");
  });

  test("nonce is single-use", () => {
    const { nonce } = createNonce(wallet);
    const r1 = consumeNonce(nonce, wallet);
    assert.equal(r1.valid, true);
    const r2 = consumeNonce(nonce, wallet);
    assert.equal(r2.valid, false);
    assert.equal(r2.reason, "unknown_nonce");
  });

  test("buildMessage deterministic untuk (wallet, nonce) yang sama", () => {
    const m1 = buildMessage(wallet, "abc123");
    const m2 = buildMessage(wallet, "abc123");
    assert.equal(m1, m2);
  });
});
