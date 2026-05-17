// SIWE-style wallet login flow.
// 1. Request nonce dari backend
// 2. User sign message di MetaMask
// 3. Verify signature → backend issue JWT
// 4. Store JWT di localStorage
import { connectWallet } from "./wallet";
import { api, setToken, clearToken, getToken } from "./api";

type NonceResponse = {
  nonce: string;
  message: string;
  expiresAt: number;
};

type VerifyResponse = {
  token: string;
  wallet: string;
  expiresIn: string;
};

type MeResponse = { wallet: string };

/**
 * Full login flow. Returns { wallet, token } on success.
 */
export async function login(): Promise<{ wallet: string; token: string }> {
  // 1. Connect wallet + ensure chain
  const { address, signer } = await connectWallet();

  // 2. Request nonce
  const { message, nonce } = await api<NonceResponse>("/api/auth/nonce", {
    method: "POST",
    body: JSON.stringify({ wallet: address }),
  });

  // 3. User signs message
  const signature = await signer.signMessage(message);

  // 4. Verify with backend
  const verifyRes = await api<VerifyResponse>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ wallet: address, signature, nonce }),
  });

  // 5. Persist JWT
  setToken(verifyRes.token);
  return { wallet: verifyRes.wallet, token: verifyRes.token };
}

export function logout() {
  clearToken();
}

/**
 * Validate stored JWT dengan ping /auth/me.
 * Returns wallet kalau valid, null kalau invalid/expired.
 */
export async function validateSession(): Promise<string | null> {
  if (!getToken()) return null;
  try {
    const res = await api<MeResponse>("/api/auth/me", { auth: true });
    return res.wallet;
  } catch {
    clearToken();
    return null;
  }
}
