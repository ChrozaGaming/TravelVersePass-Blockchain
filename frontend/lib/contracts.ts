// Contract ABIs & helpers untuk DIRECT contract calls dari FE.
// FE hanya call `mintPass` langsung (user transaction).
// Semua other calls lewat backend API.
import { Contract, ethers } from "ethers";
import { connectWallet } from "./wallet";

const TOURIST_PASS_ADDRESS = process.env.NEXT_PUBLIC_TOURIST_PASS_ADDRESS || "";

// Minimal ABI — hanya function yang dipanggil dari FE.
// Full ABI di artifacts/contracts/TouristPass.sol/TouristPass.json setelah compile.
export const TOURIST_PASS_ABI = [
  "function mintPass(string username) external",
  "function hasMinted(address) view returns (bool)",
  "function walletToToken(address) view returns (uint256)",
  "function getPassByWallet(address wallet) view returns (tuple(string username, string level, uint256 visitedCount, uint256 mintedAt))",
  "event PassMinted(address indexed user, uint256 indexed tokenId, string username, uint256 timestamp)",
] as const;

/**
 * Get TouristPass contract instance dengan signer (untuk write).
 */
export async function getTouristPassWithSigner(): Promise<Contract> {
  if (!TOURIST_PASS_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_TOURIST_PASS_ADDRESS belum di-set di .env.local"
    );
  }
  const { signer } = await connectWallet();
  return new Contract(TOURIST_PASS_ADDRESS, TOURIST_PASS_ABI, signer);
}

/**
 * User langsung mint pass via MetaMask.
 * Backend tidak terlibat — user pay gas sendiri.
 */
export async function mintPass(username: string): Promise<{
  txHash: string;
  tokenId: number;
}> {
  if (!username || username.trim().length === 0) {
    throw new Error("Username tidak boleh kosong");
  }
  if (username.length > 32) {
    throw new Error("Username maksimal 32 karakter");
  }

  const contract = await getTouristPassWithSigner();
  const tx = await contract.mintPass(username);
  const receipt = await tx.wait();

  // Extract tokenId dari event PassMinted
  let tokenId = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "PassMinted") {
        tokenId = Number(parsed.args.tokenId);
        break;
      }
    } catch {
      /* skip */
    }
  }

  return { txHash: receipt.hash, tokenId };
}

export { TOURIST_PASS_ADDRESS, ethers };
