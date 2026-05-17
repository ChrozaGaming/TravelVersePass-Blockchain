"use strict";

const { z } = require("zod");

const walletSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address");

const authNonceSchema = z.object({
  wallet: walletSchema,
});

const authVerifySchema = z.object({
  wallet: walletSchema,
  signature: z.string().min(1, "Signature required"),
});

const checkinSchema = z.object({
  qrToken: z.string().min(1, "QR token required"),
});

const destinationIdSchema = z.coerce
  .number()
  .int()
  .positive("Destination ID must be a positive integer");

/**
 * Validate request body/params with Zod. Returns parsed data atau lempar 400.
 */
function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const err = new Error("Validation failed");
    err.status = 400;
    err.details = result.error.flatten();
    throw err;
  }
  return result.data;
}

module.exports = {
  walletSchema,
  authNonceSchema,
  authVerifySchema,
  checkinSchema,
  destinationIdSchema,
  validate,
};
