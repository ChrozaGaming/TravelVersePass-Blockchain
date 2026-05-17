"use strict";

const path = require("node:path");

/**
 * Load ABI dari Hardhat artifacts. Pastikan sudah `npm run compile` di root.
 * @param {string} contractName e.g. "TouristPass"
 * @returns {Array} ABI array
 */
function loadABI(contractName) {
  const filePath = path.join(
    __dirname,
    "..", "..", "..",
    "artifacts", "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );
  try {
    return require(filePath).abi;
  } catch {
    throw new Error(
      `[abi] Cannot load ${contractName}. Run \`npm run compile\` from root first. (${filePath})`
    );
  }
}

module.exports = { loadABI };
