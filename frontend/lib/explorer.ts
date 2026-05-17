// Block explorer helpers — query Hardhat localhost RPC langsung pakai ethers.
// FE punya akses langsung ke node (CORS allowed), gak perlu lewat backend.
import { JsonRpcProvider, Contract, ethers, type Log } from "ethers";

const RPC_URL =
  process.env.NEXT_PUBLIC_CHAIN_RPC || "http://127.0.0.1:8545";

export const TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "";
export const BADGE_ADDRESS =
  process.env.NEXT_PUBLIC_BADGE_ADDRESS || "";
export const PASS_ADDRESS =
  process.env.NEXT_PUBLIC_TOURIST_PASS_ADDRESS || "";

// ABI gabungan untuk decode event di semua 3 contract.
const TOKEN_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Rewarded(address indexed user, uint256 amount, string reason)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
];

const BADGE_ABI = [
  "event BadgeMinted(address indexed user, uint256 indexed destinationId, uint256 indexed tokenId, uint256 timestamp)",
];

const PASS_ABI = [
  "event PassMinted(address indexed user, uint256 indexed tokenId, string username, uint256 timestamp)",
  "event VisitIncremented(address indexed user, uint256 indexed tokenId, uint256 newCount)",
  "event LevelUp(address indexed user, uint256 indexed tokenId, string oldLevel, string newLevel)",
];

let _provider: JsonRpcProvider | null = null;
export function getProvider(): JsonRpcProvider {
  if (!_provider) {
    _provider = new JsonRpcProvider(RPC_URL);
  }
  return _provider;
}

// =====================================================================
// Format helpers
// =====================================================================

export function formatTVT(value: bigint | string): string {
  try {
    return ethers.formatEther(value);
  } catch {
    return "0";
  }
}

export function formatETH(value: bigint | string): string {
  try {
    return ethers.formatEther(value);
  } catch {
    return "0";
  }
}

export function shortAddr(addr: string, prefix = 6, suffix = 4): string {
  if (!addr || addr.length < prefix + suffix + 2) return addr;
  return `${addr.slice(0, prefix)}...${addr.slice(-suffix)}`;
}

export function shortHash(hash: string): string {
  return shortAddr(hash, 10, 8);
}

export function formatTimestamp(unix: number): string {
  return new Date(unix * 1000).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function relativeTime(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return `${diff} detik lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

// =====================================================================
// Label well-known addresses
// =====================================================================

export function addressLabel(addr: string): string | null {
  if (!addr) return null;
  const lower = addr.toLowerCase();
  if (lower === TOKEN_ADDRESS.toLowerCase()) return "TVT Token Contract";
  if (lower === BADGE_ADDRESS.toLowerCase()) return "Destination Badge Contract";
  if (lower === PASS_ADDRESS.toLowerCase()) return "Tourist Pass Contract";
  if (lower === ethers.ZeroAddress.toLowerCase()) return "Zero Address (Mint/Burn)";
  // Hardhat default coinbase
  if (lower === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
    return "Hardhat Account #0 (Owner)";
  if (lower === "0x70997970c51812dc3a010c7d01b50e0d17dc79c8")
    return "Hardhat Account #1";
  if (lower === "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc")
    return "Hardhat Account #2";
  return null;
}

// =====================================================================
// Network stats
// =====================================================================

export type NetworkStats = {
  chainId: number;
  blockNumber: number;
  gasPrice: string;
  tvtSupply: string;
  tvtSymbol: string;
};

export async function getNetworkStats(): Promise<NetworkStats> {
  const provider = getProvider();
  const [network, blockNumber, feeData] = await Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber(),
    provider.getFeeData(),
  ]);

  let tvtSupply = "0";
  let tvtSymbol = "TVT";
  if (TOKEN_ADDRESS) {
    try {
      const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const [supply, symbol] = await Promise.all([
        token.totalSupply(),
        token.symbol(),
      ]);
      tvtSupply = ethers.formatEther(supply);
      tvtSymbol = symbol;
    } catch {
      /* contract not deployed yet */
    }
  }

  return {
    chainId: Number(network.chainId),
    blockNumber,
    gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "0",
    tvtSupply,
    tvtSymbol,
  };
}

// =====================================================================
// TVT Transfers
// =====================================================================

export type TransferEvent = {
  txHash: string;
  blockNumber: number;
  logIndex: number;
  from: string;
  to: string;
  value: bigint;
  timestamp: number;
};

export async function getRecentTransfers(limit = 50): Promise<TransferEvent[]> {
  if (!TOKEN_ADDRESS) return [];
  const provider = getProvider();
  const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

  const filter = token.filters.Transfer();
  const events = await token.queryFilter(filter, 0, "latest");

  // Sort terbaru duluan
  const sliced = events.slice(-limit).reverse();

  // Enrich dengan block timestamp
  const blockNumbers = [...new Set(sliced.map((e) => e.blockNumber))];
  const blocks = await Promise.all(
    blockNumbers.map((n) => provider.getBlock(n))
  );
  const blockTsMap = new Map(
    blocks.filter((b) => b != null).map((b) => [b!.number, b!.timestamp])
  );

  return sliced.map((ev) => {
    const event = ev as ethers.EventLog;
    return {
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      logIndex: event.index,
      from: event.args.from as string,
      to: event.args.to as string,
      value: event.args.value as bigint,
      timestamp: blockTsMap.get(event.blockNumber) || 0,
    };
  });
}

export async function getTransfersForAddress(
  addr: string,
  limit = 50
): Promise<TransferEvent[]> {
  if (!TOKEN_ADDRESS) return [];
  const provider = getProvider();
  const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

  // Query 2x filter (from + to), gabung
  const [outgoing, incoming] = await Promise.all([
    token.queryFilter(token.filters.Transfer(addr), 0, "latest"),
    token.queryFilter(token.filters.Transfer(null, addr), 0, "latest"),
  ]);

  const seen = new Set<string>();
  const all = [...outgoing, ...incoming].filter((e) => {
    const key = `${e.transactionHash}-${(e as ethers.EventLog).index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  all.sort((a, b) => b.blockNumber - a.blockNumber);
  const sliced = all.slice(0, limit);

  const blockNumbers = [...new Set(sliced.map((e) => e.blockNumber))];
  const blocks = await Promise.all(
    blockNumbers.map((n) => provider.getBlock(n))
  );
  const blockTsMap = new Map(
    blocks.filter((b) => b != null).map((b) => [b!.number, b!.timestamp])
  );

  return sliced.map((ev) => {
    const event = ev as ethers.EventLog;
    return {
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      logIndex: event.index,
      from: event.args.from as string,
      to: event.args.to as string,
      value: event.args.value as bigint,
      timestamp: blockTsMap.get(event.blockNumber) || 0,
    };
  });
}

// =====================================================================
// Transaction Detail
// =====================================================================

export type ParsedLog = {
  contract: string;
  contractName: string;
  eventName: string;
  args: Record<string, string>;
  logIndex: number;
};

export type TxDetail = {
  hash: string;
  status: "success" | "failed" | "pending";
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  from: string;
  to: string | null;
  value: string;
  valueWei: bigint;
  nonce: number;
  index: number;
  gasUsed: string;
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas: string | null;
  maxPriorityFeePerGas: string | null;
  fee: string;
  type: number;
  chainId: number;
  input: string;
  logs: ParsedLog[];
};

function getInterfaceFor(addr: string): {
  iface: ethers.Interface;
  name: string;
} | null {
  const lower = addr.toLowerCase();
  if (lower === TOKEN_ADDRESS.toLowerCase()) {
    return { iface: new ethers.Interface(TOKEN_ABI), name: "RewardToken" };
  }
  if (lower === BADGE_ADDRESS.toLowerCase()) {
    return {
      iface: new ethers.Interface(BADGE_ABI),
      name: "DestinationBadge",
    };
  }
  if (lower === PASS_ADDRESS.toLowerCase()) {
    return { iface: new ethers.Interface(PASS_ABI), name: "TouristPass" };
  }
  return null;
}

function parseLogSafe(log: Log): ParsedLog | null {
  const known = getInterfaceFor(log.address);
  if (!known) return null;
  try {
    const parsed = known.iface.parseLog({
      topics: [...log.topics],
      data: log.data,
    });
    if (!parsed) return null;
    const args: Record<string, string> = {};
    parsed.fragment.inputs.forEach((input, idx) => {
      const v = parsed.args[idx];
      args[input.name] = typeof v === "bigint" ? v.toString() : String(v);
    });
    return {
      contract: log.address,
      contractName: known.name,
      eventName: parsed.name,
      args,
      logIndex: log.index,
    };
  } catch {
    return null;
  }
}

export async function getTxDetail(hash: string): Promise<TxDetail | null> {
  const provider = getProvider();
  const [tx, receipt] = await Promise.all([
    provider.getTransaction(hash),
    provider.getTransactionReceipt(hash),
  ]);
  if (!tx) return null;

  const block = receipt
    ? await provider.getBlock(receipt.blockNumber)
    : null;

  const logs: ParsedLog[] = [];
  if (receipt) {
    for (const log of receipt.logs) {
      const parsed = parseLogSafe(log);
      if (parsed) logs.push(parsed);
    }
  }

  const gasUsed = receipt ? receipt.gasUsed : 0n;
  const gasPrice = receipt
    ? (receipt as ethers.TransactionReceipt).gasPrice ?? tx.gasPrice ?? 0n
    : tx.gasPrice ?? 0n;
  const fee = gasUsed * gasPrice;

  return {
    hash: tx.hash,
    status: !receipt
      ? "pending"
      : receipt.status === 1
        ? "success"
        : "failed",
    blockNumber: receipt?.blockNumber ?? 0,
    blockHash: receipt?.blockHash ?? "",
    timestamp: block?.timestamp ?? 0,
    from: tx.from,
    to: tx.to,
    value: ethers.formatEther(tx.value),
    valueWei: tx.value,
    nonce: tx.nonce,
    index: receipt?.index ?? 0,
    gasUsed: gasUsed.toString(),
    gasLimit: tx.gasLimit.toString(),
    gasPrice: ethers.formatUnits(gasPrice, "gwei"),
    maxFeePerGas: tx.maxFeePerGas
      ? ethers.formatUnits(tx.maxFeePerGas, "gwei")
      : null,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas
      ? ethers.formatUnits(tx.maxPriorityFeePerGas, "gwei")
      : null,
    fee: ethers.formatEther(fee),
    type: tx.type ?? 0,
    chainId: Number(tx.chainId),
    input: tx.data,
    logs,
  };
}

// =====================================================================
// Block Detail
// =====================================================================

export type BlockDetail = {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  miner: string;
  nonce: string;
  difficulty: string;
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas: string | null;
  txCount: number;
  txHashes: string[];
  size: number | null;
};

export async function getBlockDetail(
  numberOrHash: number | string
): Promise<BlockDetail | null> {
  const provider = getProvider();
  const block = await provider.getBlock(numberOrHash);
  if (!block) return null;

  return {
    number: block.number,
    hash: block.hash || "",
    parentHash: block.parentHash,
    timestamp: block.timestamp,
    miner: block.miner,
    nonce: block.nonce,
    difficulty: block.difficulty.toString(),
    gasUsed: block.gasUsed.toString(),
    gasLimit: block.gasLimit.toString(),
    baseFeePerGas: block.baseFeePerGas
      ? ethers.formatUnits(block.baseFeePerGas, "gwei")
      : null,
    txCount: block.transactions.length,
    txHashes: [...block.transactions],
    size: null, // ethers v6 doesn't expose size on Block
  };
}

// =====================================================================
// Address Info
// =====================================================================

export type AddressInfo = {
  address: string;
  label: string | null;
  ethBalance: string;
  tvtBalance: string;
  txCount: number;
  isContract: boolean;
};

export async function getAddressInfo(addr: string): Promise<AddressInfo> {
  const provider = getProvider();
  const checksummed = ethers.getAddress(addr);

  const [ethBalance, txCount, code] = await Promise.all([
    provider.getBalance(checksummed),
    provider.getTransactionCount(checksummed),
    provider.getCode(checksummed),
  ]);

  let tvtBalance = "0";
  if (TOKEN_ADDRESS) {
    try {
      const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const bal = await token.balanceOf(checksummed);
      tvtBalance = ethers.formatEther(bal);
    } catch {
      /* skip */
    }
  }

  return {
    address: checksummed,
    label: addressLabel(checksummed),
    ethBalance: ethers.formatEther(ethBalance),
    tvtBalance,
    txCount,
    isContract: code !== "0x" && code !== "0x0",
  };
}

// =====================================================================
// Check-in Feed (BadgeMinted events — public, all users)
// =====================================================================

export type CheckinEvent = {
  txHash: string;
  blockNumber: number;
  logIndex: number;
  user: string;
  destinationId: number;
  tokenId: number;
  timestamp: number;
};

export async function getRecentCheckins(
  limit = 50,
  destinationIdFilter?: number
): Promise<CheckinEvent[]> {
  if (!BADGE_ADDRESS) return [];
  const provider = getProvider();
  const badge = new Contract(BADGE_ADDRESS, BADGE_ABI, provider);

  const filter = destinationIdFilter !== undefined
    ? badge.filters.BadgeMinted(null, destinationIdFilter)
    : badge.filters.BadgeMinted();

  const events = await badge.queryFilter(filter, 0, "latest");
  const sliced = events.slice(-limit).reverse();

  const blockNumbers = [...new Set(sliced.map((e) => e.blockNumber))];
  const blocks = await Promise.all(
    blockNumbers.map((n) => provider.getBlock(n))
  );
  const blockTsMap = new Map(
    blocks.filter((b) => b != null).map((b) => [b!.number, b!.timestamp])
  );

  return sliced.map((ev) => {
    const event = ev as ethers.EventLog;
    return {
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      logIndex: event.index,
      user: event.args.user as string,
      destinationId: Number(event.args.destinationId),
      tokenId: Number(event.args.tokenId),
      timestamp: blockTsMap.get(event.blockNumber) || 0,
    };
  });
}

// Aggregate stats per destinasi (untuk leaderboard di /explorer/destinations)
export type DestinationStats = {
  destinationId: number;
  checkinCount: number;
  uniqueVisitors: number;
  lastCheckinAt: number;
};

export async function getDestinationStats(): Promise<DestinationStats[]> {
  const checkins = await getRecentCheckins(1000);
  const grouped = new Map<
    number,
    { count: number; visitors: Set<string>; lastTs: number }
  >();

  for (const c of checkins) {
    const existing = grouped.get(c.destinationId) ?? {
      count: 0,
      visitors: new Set<string>(),
      lastTs: 0,
    };
    existing.count++;
    existing.visitors.add(c.user.toLowerCase());
    if (c.timestamp > existing.lastTs) existing.lastTs = c.timestamp;
    grouped.set(c.destinationId, existing);
  }

  return Array.from(grouped.entries())
    .map(([destinationId, g]) => ({
      destinationId,
      checkinCount: g.count,
      uniqueVisitors: g.visitors.size,
      lastCheckinAt: g.lastTs,
    }))
    .sort((a, b) => b.checkinCount - a.checkinCount);
}

// Cek apakah suatu tx adalah check-in tx (mint badge).
// Return destinationId + tokenId kalau iya, null kalau bukan.
export async function getCheckinContext(
  txHash: string
): Promise<{ destinationId: number; tokenId: number; user: string } | null> {
  const provider = getProvider();
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) return null;

  if (!BADGE_ADDRESS) return null;
  const badgeIface = new ethers.Interface(BADGE_ABI);

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== BADGE_ADDRESS.toLowerCase()) continue;
    try {
      const parsed = badgeIface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (parsed?.name === "BadgeMinted") {
        return {
          destinationId: Number(parsed.args.destinationId),
          tokenId: Number(parsed.args.tokenId),
          user: parsed.args.user as string,
        };
      }
    } catch {
      /* skip */
    }
  }
  return null;
}

// =====================================================================
// Destination metadata (dari backend, di-cache di module)
// =====================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
let _destCache: Map<number, {
  id: number;
  name: string;
  description: string;
  location_lat: string;
  location_lng: string;
  image_url: string;
}> | null = null;

export type ExplorerDestination = {
  id: number;
  name: string;
  description: string;
  location_lat: string;
  location_lng: string;
  image_url: string;
};

export async function getAllDestinations(): Promise<ExplorerDestination[]> {
  if (_destCache && _destCache.size > 0) {
    return Array.from(_destCache.values());
  }
  try {
    const res = await fetch(`${API_URL}/api/destinations`);
    if (!res.ok) return [];
    const json = await res.json();
    const list = (json.destinations || []) as ExplorerDestination[];
    _destCache = new Map(list.map((d) => [d.id, d]));
    return list;
  } catch {
    return [];
  }
}

export async function getDestinationById(
  id: number
): Promise<ExplorerDestination | null> {
  await getAllDestinations(); // populate cache
  return _destCache?.get(id) ?? null;
}

// =====================================================================
// Search (auto-detect: hash, address, block number)
// =====================================================================

export type SearchResult =
  | { kind: "tx"; value: string }
  | { kind: "address"; value: string }
  | { kind: "block"; value: number }
  | { kind: "unknown" };

export function classifySearch(input: string): SearchResult {
  const trimmed = input.trim();
  if (!trimmed) return { kind: "unknown" };

  // Block number (digit saja)
  if (/^\d+$/.test(trimmed)) {
    return { kind: "block", value: Number.parseInt(trimmed, 10) };
  }

  // Tx hash (0x + 64 hex)
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return { kind: "tx", value: trimmed };
  }

  // Address (0x + 40 hex)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return { kind: "address", value: trimmed };
  }

  return { kind: "unknown" };
}
