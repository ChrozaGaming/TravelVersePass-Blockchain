// Shared TypeScript types antara FE & backend response.
// Match dengan response shape di docs/BACKEND.md.

export type PassData = {
  username: string;
  level: "Beginner" | "Explorer" | "Adventurer" | "Legendary Traveler";
  visitedCount: number;
  mintedAt: string;
};

export type Destination = {
  id: number;
  name: string;
  description: string;
  location_lat: string;
  location_lng: string;
  image_url: string;
  created_at?: string;
};

export type Badge = {
  tokenId: number;
  destination: Destination;
  mintedAt: string;
  txHashes: {
    badge: string | null;
    visit: string | null;
    reward: string | null;
    levelUp: string | null;
  } | null;
  levelAfter: string | null;
};

export type Visit = {
  id: string;
  destination: { id: number; name: string; image_url: string };
  visitedAt: string;
  badgeTokenId: number;
  txHash: string;
  levelAfter: string | null;
};

export type Timeline = Record<string, Visit[]>;

export type LevelUpInfo = {
  oldLevel: string;
  newLevel: string;
};

export type CheckinResult = {
  success: boolean;
  destination: { id: number; name: string };
  badge: { tokenId: number; destinationId: number };
  reward: { checkin: string; levelUpBonus: string | null };
  levelUp: LevelUpInfo | null;
  txHashes: {
    badge: string;
    visit: string;
    reward: string;
    levelUpBonus: string | null;
  };
};

export type QRPayload = {
  destination: { id: number; name: string; image_url: string };
  token: string;
  dataUrl: string;
  issuedAt: number;
  expiresAt: number;
  ttlSeconds: number;
};

export type ApiError = {
  error: string;
  message: string;
  details?: unknown;
};
