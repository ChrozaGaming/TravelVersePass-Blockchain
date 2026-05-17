// MetaMask wallet helpers + network switching.
import { BrowserProvider, JsonRpcSigner } from "ethers";

const CHAIN_ID = Number.parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || "80002",
  10
);
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || "Polygon Amoy";
const CHAIN_RPC =
  process.env.NEXT_PUBLIC_CHAIN_RPC || "https://rpc-amoy.polygon.technology/";
const BLOCK_EXPLORER =
  process.env.NEXT_PUBLIC_BLOCK_EXPLORER || "https://amoy.polygonscan.com";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function hasWallet(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export function getProvider(): BrowserProvider | null {
  if (!hasWallet()) return null;
  return new BrowserProvider(window.ethereum!);
}

export async function connectWallet(): Promise<{
  address: string;
  signer: JsonRpcSigner;
}> {
  if (!hasWallet()) {
    throw new Error(
      "MetaMask tidak terinstall. Install dulu di https://metamask.io"
    );
  }
  const provider = getProvider()!;
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // Pastikan di Polygon Amoy
  await ensureCorrectNetwork();

  return { address, signer };
}

export async function ensureCorrectNetwork(): Promise<void> {
  if (!hasWallet()) throw new Error("No wallet");
  const provider = getProvider()!;
  const network = await provider.getNetwork();
  if (Number(network.chainId) === CHAIN_ID) return;

  const hexChainId = "0x" + CHAIN_ID.toString(16);
  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (err) {
    // Chain belum ditambahkan ke MetaMask — add baru
    const switchError = err as { code?: number };
    if (switchError.code === 4902) {
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: CHAIN_NAME,
            rpcUrls: [CHAIN_RPC],
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            blockExplorerUrls: [BLOCK_EXPLORER],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export function shortAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export { CHAIN_ID, CHAIN_NAME, CHAIN_RPC, BLOCK_EXPLORER };
