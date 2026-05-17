"use strict";

const { ethers } = require("ethers");
const config = require("../config");
const { loadABI } = require("../lib/abi");

// ----------------------------------------------------------------------
// Provider & Signer (lazy-init agar tests bisa mock kalau perlu)
// ----------------------------------------------------------------------

let _provider;
let _signer;
let _touristPass;
let _badge;
let _token;

function getProvider() {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(
      config.blockchain.rpcUrl,
      config.blockchain.chainId
    );
  }
  return _provider;
}

function getSigner() {
  if (!_signer) {
    // Wrap Wallet in NonceManager untuk auto-manage nonce
    // Mencegah "nonce too low" saat concurrent tx.
    const wallet = new ethers.Wallet(
      config.blockchain.ownerPrivateKey,
      getProvider()
    );
    _signer = new ethers.NonceManager(wallet);
  }
  return _signer;
}

// ----------------------------------------------------------------------
// Mutex untuk serialize tx — pastikan gak ada concurrent send dari signer.
// Hardhat automine reject concurrent tx, jadi kita queue.
// ----------------------------------------------------------------------
let _txQueue = Promise.resolve();
function withTxLock(fn) {
  const prev = _txQueue;
  let release;
  _txQueue = new Promise((resolve) => {
    release = resolve;
  });
  return prev.then(async () => {
    try {
      return await fn();
    } finally {
      release();
    }
  });
}

function getTouristPass() {
  if (!_touristPass) {
    _touristPass = new ethers.Contract(
      config.blockchain.contracts.touristPass,
      loadABI("TouristPass"),
      getSigner()
    );
  }
  return _touristPass;
}

function getBadge() {
  if (!_badge) {
    _badge = new ethers.Contract(
      config.blockchain.contracts.badge,
      loadABI("DestinationBadge"),
      getSigner()
    );
  }
  return _badge;
}

function getToken() {
  if (!_token) {
    _token = new ethers.Contract(
      config.blockchain.contracts.token,
      loadABI("RewardToken"),
      getSigner()
    );
  }
  return _token;
}

// ----------------------------------------------------------------------
// Read helpers
// ----------------------------------------------------------------------

async function getPass(wallet) {
  const tp = getTouristPass();
  const hasMinted = await tp.hasMinted(wallet);
  if (!hasMinted) return null;
  const data = await tp.getPassByWallet(wallet);
  return {
    username: data.username,
    level: data.level,
    visitedCount: Number(data.visitedCount),
    mintedAt: new Date(Number(data.mintedAt) * 1000).toISOString(),
  };
}

async function getTokenBalance(wallet) {
  const t = getToken();
  const balance = await t.balanceOf(wallet);
  return ethers.formatEther(balance);
}

async function getUserBadgeIds(wallet) {
  const b = getBadge();
  const ids = await b.getUserBadges(wallet);
  return ids.map((id) => Number(id));
}

async function getBadgeData(tokenId) {
  const b = getBadge();
  const data = await b.badgeData(tokenId);
  return {
    tokenId,
    destinationId: Number(data.destinationId),
    mintedAt: new Date(Number(data.mintedAt) * 1000).toISOString(),
  };
}

async function canClaimToday(wallet, destinationId) {
  const b = getBadge();
  return await b.canClaimToday(wallet, destinationId);
}

// ----------------------------------------------------------------------
// Write — Check-in Orchestration
// ----------------------------------------------------------------------

/**
 * Orchestrate full check-in flow on-chain:
 *   1. mintBadge(user, destId)
 *   2. incrementVisit(user)
 *   3. rewardCheckin(user)
 *   4. (kalau LevelUp di emit) rewardLevelUp(user)
 *
 * Returns: { txHashes, badge, levelUp, tokenId }
 */
async function processCheckin(userWallet, destinationId) {
  const tp = getTouristPass();
  const b = getBadge();
  const t = getToken();

  // Pre-check: user harus sudah punya pass (read, no lock needed)
  const hasMinted = await tp.hasMinted(userWallet);
  if (!hasMinted) {
    const err = new Error("User has no Tourist Pass");
    err.status = 400;
    err.code = "NO_PASS";
    throw err;
  }

  // Serialize semua write tx via mutex — mencegah concurrent scan dari user
  // menyebabkan nonce conflict di Hardhat (yang automine reject queueing).
  return withTxLock(() => orchestrateOnChain(b, tp, t, userWallet, destinationId));
}

async function orchestrateOnChain(b, tp, t, userWallet, destinationId) {
  // 1. Mint badge — revert kalau sudah claim hari ini
  const badgeTx = await b.mintBadge(userWallet, destinationId);
  const badgeReceipt = await badgeTx.wait();

  // Extract tokenId dari event BadgeMinted
  let badgeTokenId = null;
  for (const log of badgeReceipt.logs) {
    try {
      const parsed = b.interface.parseLog(log);
      if (parsed?.name === "BadgeMinted") {
        badgeTokenId = Number(parsed.args.tokenId);
        break;
      }
    } catch {
      /* skip non-matching logs */
    }
  }

  // 2. Increment visit
  const visitTx = await tp.incrementVisit(userWallet);
  const visitReceipt = await visitTx.wait();

  // Extract level up info (kalau ada)
  let levelUp = null;
  for (const log of visitReceipt.logs) {
    try {
      const parsed = tp.interface.parseLog(log);
      if (parsed?.name === "LevelUp") {
        levelUp = {
          oldLevel: parsed.args.oldLevel,
          newLevel: parsed.args.newLevel,
        };
      }
    } catch {
      /* skip */
    }
  }

  // 3. Reward 10 TVT
  const rewardTx = await t.rewardCheckin(userWallet);
  const rewardReceipt = await rewardTx.wait();

  // 4. Bonus level up (kalau berlaku)
  let levelUpTxHash = null;
  if (levelUp) {
    const bonusTx = await t.rewardLevelUp(userWallet);
    const bonusReceipt = await bonusTx.wait();
    levelUpTxHash = bonusReceipt.hash;
  }

  return {
    badgeTokenId,
    levelUp,
    txHashes: {
      badge: badgeReceipt.hash,
      visit: visitReceipt.hash,
      reward: rewardReceipt.hash,
      levelUpBonus: levelUpTxHash,
    },
  };
}

module.exports = {
  getProvider,
  getSigner,
  getTouristPass,
  getBadge,
  getToken,
  getPass,
  getTokenBalance,
  getUserBadgeIds,
  getBadgeData,
  canClaimToday,
  processCheckin,
};
