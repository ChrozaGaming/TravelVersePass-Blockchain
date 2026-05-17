"use strict";

require("./_setup");

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const { signToken, verifyToken } = require("../src/services/jwt");

describe("JWT Service", () => {
  const wallet = "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01";

  test("signToken returns string token", () => {
    const token = signToken(wallet);
    assert.equal(typeof token, "string");
    assert.ok(token.length > 20);
    // JWT format: header.payload.signature
    assert.equal(token.split(".").length, 3);
  });

  test("verifyToken returns payload with lowercase wallet", () => {
    const token = signToken(wallet);
    const payload = verifyToken(token);
    assert.equal(payload.wallet, wallet.toLowerCase());
  });

  test("verifyToken rejects tampered token", () => {
    const token = signToken(wallet);
    const tampered = token.slice(0, -2) + "XX";
    assert.throws(() => verifyToken(tampered));
  });

  test("verifyToken rejects invalid token", () => {
    assert.throws(() => verifyToken("not.a.jwt"));
    assert.throws(() => verifyToken(""));
  });

  test("payload includes exp claim", () => {
    const token = signToken(wallet);
    const payload = verifyToken(token);
    assert.equal(typeof payload.exp, "number");
    assert.ok(payload.exp > Math.floor(Date.now() / 1000));
  });
});
