<div align="center">

# 🧪 Simulation Flow — Get TVT + Badge

## *Step-by-Step API Flow (Postman-style)*

**Base URL:** `http://localhost:4000`

> Dokumen ini menjelaskan flow lengkap dari **login → mint pass → check-in → dapat TVT + badge** menggunakan HTTP request seperti di Postman.

</div>

---

## 📋 Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: AUTHENTICATION                                      │
│   1. POST /api/auth/nonce       → dapat nonce               │
│   2. [Off-chain]                → user sign di MetaMask     │
│   3. POST /api/auth/verify      → dapat JWT                 │
├─────────────────────────────────────────────────────────────┤
│ PHASE 2: MINT TOURIST PASS (pre-requisite)                   │
│   4. [Direct contract]          → user mintPass via MetaMask│
├─────────────────────────────────────────────────────────────┤
│ PHASE 3: OPERATOR PASANG QR DI LOKASI                        │
│   5. GET /api/destinations/:id/qr → dapat QR token + image  │
├─────────────────────────────────────────────────────────────┤
│ PHASE 4: USER CHECK-IN (CORE FLOW)                           │
│   6. POST /api/checkin          → mint badge + dapat TVT    │
├─────────────────────────────────────────────────────────────┤
│ PHASE 5: VERIFY HASIL                                        │
│   7. GET /api/me                → cek balance TVT           │
│   8. GET /api/me/badges         → lihat koleksi NFT         │
│   9. GET /api/me/timeline       → record kunjungan          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Variables (Postman Environment)

Set variabel ini di Postman Environment supaya bisa di-reuse antar request:

| Variable | Value | Catatan |
|:---|:---|:---|
| `BASE_URL` | `http://localhost:4000` | Backend API |
| `WALLET` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Hardhat Account #1 |
| `JWT` | `(set after step 3)` | Token dari verify endpoint |
| `NONCE` | `(set after step 1)` | Nonce dari nonce endpoint |
| `SIGNATURE` | `(set after step 2)` | Hasil sign MetaMask |

---

## 🚀 Step 1 — Request Nonce

**Tujuan:** Minta server generate random nonce untuk login.

### Request

```http
POST {{BASE_URL}}/api/auth/nonce
Content-Type: application/json

{
  "wallet": "{{WALLET}}"
}
```

### cURL

```bash
curl -X POST http://localhost:4000/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}'
```

### Response 200

```json
{
  "nonce": "0ab6fc4d2166597af21a9e5b685f425c",
  "message": "Welcome to TravelVerse Pass!\n\nSign this message to login. This action does not cost gas.\n\nWallet: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8\nNonce: 0ab6fc4d2166597af21a9e5b685f425c",
  "expiresAt": 1779037078043
}
```

✅ **Action:** Save `nonce` dan `message` untuk step berikutnya.

---

## ✍️ Step 2 — Sign Message (Off-chain)

**Tujuan:** User sign message dengan private key wallet untuk membuktikan ownership.

⚠️ **Ini tidak bisa lewat Postman** — harus pakai MetaMask atau ethers.js.

### Cara A: Via FE App (real flow)

User klik "Login" di app → MetaMask popup → click Sign → dapat signature.

### Cara B: Manual via Node.js (untuk testing Postman)

```bash
node -e "
const { Wallet } = require('ethers');
const w = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const message = 'Welcome to TravelVerse Pass!\n\nSign this message to login. This action does not cost gas.\n\nWallet: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8\nNonce: PASTE_NONCE_DARI_STEP_1';
w.signMessage(message).then(sig => console.log(sig));
"
```

**⚠️ Penting:** `message` HARUS persis sama dengan yang di response step 1 (termasuk `\n` dan lowercase wallet).

### Output

```
0x1a2b3c4d5e6f...... (132 chars hex string)
```

✅ **Action:** Save signature untuk step 3.

---

## 🎟️ Step 3 — Verify Signature → Get JWT

**Tujuan:** Server verify signature, terbitkan JWT untuk session.

### Request

```http
POST {{BASE_URL}}/api/auth/verify
Content-Type: application/json

{
  "wallet": "{{WALLET}}",
  "signature": "{{SIGNATURE}}",
  "nonce": "{{NONCE}}"
}
```

### cURL

```bash
curl -X POST http://localhost:4000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "signature": "0x1a2b3c...",
    "nonce": "0ab6fc4d2166597af21a9e5b685f425c"
  }'
```

### Response 200

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXQiOiIweDcwOTk3OTcwYzUxODEyZGMzYTAxMGM3ZDAxYjUwZTBkMTdkYzc5YzgiLCJpYXQiOjE3NzkwMzc..." ,
  "wallet": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "expiresIn": "7d"
}
```

### Possible Errors

| Status | error | Cause |
|:---:|:---|:---|
| 401 | `invalid_nonce` | Nonce expired / sudah dipakai / wallet mismatch |
| 401 | `invalid_signature` | Signature gak match wallet |

✅ **Action:** Save `token` sebagai `JWT` variable. Pakai di header `Authorization: Bearer {{JWT}}` di request berikutnya.

---

## 🪪 Step 4 — Mint Tourist Pass (Direct Contract)

**Tujuan:** User mint NFT pass (1x per wallet). User bayar gas sendiri.

⚠️ **Ini bukan API call — direct contract call** via MetaMask. Postman gak bisa langsung trigger.

### Via FE

User buka `/mint-pass` → input username → klik Mint → MetaMask popup → confirm tx.

### Via Hardhat Console (untuk test backend tanpa FE)

```bash
cd /Users/macbookpro/travelversepass-blockchain
npx hardhat console --network localhost
```

```js
const [_, user1] = await ethers.getSigners();
const TouristPass = await ethers.getContractFactory("TouristPass");
const tp = TouristPass.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
const tx = await tp.connect(user1).mintPass("Hilmy");
await tx.wait();
console.log("Pass minted!");
```

### Verify via API

```bash
# Cek pass data via backend
curl -H "Authorization: Bearer {{JWT}}" http://localhost:4000/api/me
```

Response harus tampil `pass: {...}` instead of `pass: null`.

---

## 📱 Step 5 — Get QR untuk Destinasi

**Tujuan:** Operator/tablet di lokasi wisata dapat QR code yang rotating.

### Request

```http
GET {{BASE_URL}}/api/destinations/1/qr
```

No auth required — siapa saja di lokasi bisa polling.

### cURL

```bash
curl http://localhost:4000/api/destinations/1/qr
```

### Response 200

```json
{
  "destination": {
    "id": 1,
    "name": "Candi Borobudur",
    "image_url": "https://..."
  },
  "token": "1.1779037200.1779038100.abc123def456...",
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "issuedAt": 1779037200,
  "expiresAt": 1779038100,
  "ttlSeconds": 900
}
```

✅ **Action:** Save `token` (format `<destId>.<iat>.<exp>.<hmac>`) untuk step 6.

---

## 🎯 Step 6 — Check-in! (Core Flow)

**Tujuan:** Submit QR token → backend orchestrate semua on-chain calls → user dapat **badge NFT + 10 TVT** (+200 bonus kalau level up).

### Request

```http
POST {{BASE_URL}}/api/checkin
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "qrToken": "{{QR_TOKEN}}"
}
```

### cURL

```bash
curl -X POST http://localhost:4000/api/checkin \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "1.1779037200.1779038100.abc123def456..."
  }'
```

### Response 200 (No Level Up)

```json
{
  "success": true,
  "destination": {
    "id": 1,
    "name": "Candi Borobudur"
  },
  "badge": {
    "tokenId": 1,
    "destinationId": 1
  },
  "reward": {
    "checkin": "10.0",
    "levelUpBonus": null
  },
  "levelUp": null,
  "txHashes": {
    "badge": "0xabc123def456...",
    "visit": "0x456def789012...",
    "reward": "0x789012345abc...",
    "levelUpBonus": null
  }
}
```

### Response 200 (With Level Up — Visit #6 → Explorer)

```json
{
  "success": true,
  "destination": {
    "id": 2,
    "name": "Gunung Bromo"
  },
  "badge": {
    "tokenId": 6,
    "destinationId": 2
  },
  "reward": {
    "checkin": "10.0",
    "levelUpBonus": "200.0"
  },
  "levelUp": {
    "oldLevel": "Beginner",
    "newLevel": "Explorer"
  },
  "txHashes": {
    "badge": "0xabc...",
    "visit": "0xdef...",
    "reward": "0x123...",
    "levelUpBonus": "0x456..."
  }
}
```

### Apa Yang Terjadi On-chain

Backend (sebagai owner) memanggil 3-4 transaksi berurutan:

```
1. DestinationBadge.mintBadge(user, destId)        → NFT badge baru
2. TouristPass.incrementVisit(user)                 → counter +1, mungkin LevelUp event
3. RewardToken.rewardCheckin(user)                  → +10 TVT
4. RewardToken.rewardLevelUp(user) [conditional]    → +200 TVT bonus
```

### Possible Errors

| Status | error | Cause |
|:---:|:---|:---|
| 400 | `invalid_qr` | QR malformed / signature invalid / expired (>15 menit) |
| 400 | `NO_PASS` | User belum mint Tourist Pass — lakukan Step 4 dulu |
| 404 | `destination_not_found` | Destination ID tidak ada di DB |
| 429 | `ALREADY_CLAIMED` | Sudah claim badge di destinasi ini hari ini |
| 503 | `REWARD_POOL_EMPTY` | Pool reward token habis |

---

## ✅ Step 7 — Verify Balance TVT

**Tujuan:** Konfirmasi balance bertambah +10 (atau +210 kalau level up).

### Request

```http
GET {{BASE_URL}}/api/me
Authorization: Bearer {{JWT}}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:4000/api/me
```

### Response 200

```json
{
  "wallet": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "pass": {
    "username": "Hilmy",
    "level": "Beginner",
    "visitedCount": 1,
    "mintedAt": "2026-05-18T10:30:00.000Z"
  },
  "balance": "10.0"
}
```

✅ **Verify:** `balance` harus naik dari `0.0` → `10.0` (atau +210.0 kalau level up).

---

## 🏅 Step 8 — Lihat Koleksi Badge

**Tujuan:** Konfirmasi NFT badge baru ada di wallet.

### Request

```http
GET {{BASE_URL}}/api/me/badges
Authorization: Bearer {{JWT}}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:4000/api/me/badges
```

### Response 200

```json
{
  "badges": [
    {
      "tokenId": 1,
      "destination": {
        "id": 1,
        "name": "Candi Borobudur",
        "image_url": "https://...",
        "location_lat": "-7.60790000",
        "location_lng": "110.20380000"
      },
      "mintedAt": "2026-05-18T10:35:42.000Z"
    }
  ]
}
```

✅ **Verify:** Badge baru muncul dengan `tokenId` sesuai response Step 6.

---

## 📅 Step 9 — Lihat Timeline

**Tujuan:** Konfirmasi visit di-record di database.

### Request

```http
GET {{BASE_URL}}/api/me/timeline
Authorization: Bearer {{JWT}}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:4000/api/me/timeline
```

### Response 200

```json
{
  "timeline": {
    "2026": [
      {
        "id": "uuid-here",
        "destination": {
          "id": 1,
          "name": "Candi Borobudur",
          "image_url": "https://..."
        },
        "visitedAt": "2026-05-18T10:35:42.123Z",
        "badgeTokenId": 1,
        "txHash": "0xabc...",
        "levelAfter": null
      }
    ]
  }
}
```

✅ **Verify:** Timeline berisi 1 visit di tahun 2026.

---

## 🎉 Hasil Akhir

Setelah semua step berhasil:

| Item | Before | After |
|:---|:---:|:---:|
| **TVT Balance** | 0.0 | 10.0 (atau 210.0 kalau level up) |
| **Badge NFT** | 0 | 1 (Token #1 — Borobudur) |
| **Visit Count** | 0 | 1 |
| **Level** | Beginner | Beginner (atau Explorer kalau ≥6 visits) |
| **DB Visits row** | 0 | 1 |

---

## 🔁 Repeat for Level Up Demo

Untuk demonstrate **level up dari Beginner ke Explorer**, ulangi flow check-in **6 kali** (di destinasi berbeda atau tunggu 1 hari per destinasi):

| Visit | Destinasi | Total Visits | Level | Reward |
|:---:|:---|:---:|:---:|:---:|
| 1 | Borobudur | 1 | Beginner | +10 TVT |
| 2 | Bromo | 2 | Beginner | +10 TVT |
| 3 | Kuta | 3 | Beginner | +10 TVT |
| 4 | Toba | 4 | Beginner | +10 TVT |
| 5 | Raja Ampat | 5 | Beginner | +10 TVT |
| 6 | Toraja | 6 | **Explorer** 🎉 | +10 +200 TVT |

Setelah visit ke-6, response check-in akan punya:
```json
"levelUp": {
  "oldLevel": "Beginner",
  "newLevel": "Explorer"
},
"reward": {
  "checkin": "10.0",
  "levelUpBonus": "200.0"
}
```

Total TVT setelah 6 visits = 60 + 200 = **260 TVT**.

---

## 🛠️ Postman Collection JSON

Bisa di-import ke Postman:

<details>
<summary>📄 <b>Lihat Postman Collection (Import)</b></summary>

```json
{
  "info": {
    "name": "TravelVerse Pass — API Flow",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "BASE_URL", "value": "http://localhost:4000" },
    { "key": "WALLET", "value": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
    { "key": "JWT", "value": "" },
    { "key": "NONCE", "value": "" },
    { "key": "SIGNATURE", "value": "" },
    { "key": "QR_TOKEN", "value": "" }
  ],
  "item": [
    {
      "name": "1. Auth — Request Nonce",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{BASE_URL}}/api/auth/nonce",
        "body": { "mode": "raw", "raw": "{\"wallet\":\"{{WALLET}}\"}" }
      }
    },
    {
      "name": "2. Auth — Verify Signature",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{BASE_URL}}/api/auth/verify",
        "body": {
          "mode": "raw",
          "raw": "{\"wallet\":\"{{WALLET}}\",\"signature\":\"{{SIGNATURE}}\",\"nonce\":\"{{NONCE}}\"}"
        }
      }
    },
    {
      "name": "3. Auth — Check Me (JWT valid?)",
      "request": {
        "method": "GET",
        "header": [{ "key": "Authorization", "value": "Bearer {{JWT}}" }],
        "url": "{{BASE_URL}}/api/auth/me"
      }
    },
    {
      "name": "4. Destinations — List All",
      "request": { "method": "GET", "url": "{{BASE_URL}}/api/destinations" }
    },
    {
      "name": "5. Destinations — Get QR (Borobudur)",
      "request": { "method": "GET", "url": "{{BASE_URL}}/api/destinations/1/qr" }
    },
    {
      "name": "6. Check-in",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{JWT}}" }
        ],
        "url": "{{BASE_URL}}/api/checkin",
        "body": { "mode": "raw", "raw": "{\"qrToken\":\"{{QR_TOKEN}}\"}" }
      }
    },
    {
      "name": "7. Me — Profile + Balance",
      "request": {
        "method": "GET",
        "header": [{ "key": "Authorization", "value": "Bearer {{JWT}}" }],
        "url": "{{BASE_URL}}/api/me"
      }
    },
    {
      "name": "8. Me — Badges Collection",
      "request": {
        "method": "GET",
        "header": [{ "key": "Authorization", "value": "Bearer {{JWT}}" }],
        "url": "{{BASE_URL}}/api/me/badges"
      }
    },
    {
      "name": "9. Me — Journey Timeline",
      "request": {
        "method": "GET",
        "header": [{ "key": "Authorization", "value": "Bearer {{JWT}}" }],
        "url": "{{BASE_URL}}/api/me/timeline"
      }
    }
  ]
}
```

**Cara Import:**
1. Buka Postman
2. Klik **Import** (kiri atas)
3. Pilih **Raw text** → paste JSON di atas
4. Klik **Continue** → **Import**
5. Set environment variables di tab **Environment** Postman

</details>

---

## 🧪 Test Script (Otomatisasi via Bash)

Untuk run full flow tanpa Postman, simpan sebagai `test-flow.sh`:

```bash
#!/bin/bash
set -e

BASE_URL="http://localhost:4000"
WALLET="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
PRIVATE_KEY="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

echo "=== STEP 1: Request nonce ==="
NONCE_RES=$(curl -s -X POST "$BASE_URL/api/auth/nonce" \
  -H "Content-Type: application/json" \
  -d "{\"wallet\":\"$WALLET\"}")
echo "$NONCE_RES" | jq
NONCE=$(echo "$NONCE_RES" | jq -r '.nonce')
MESSAGE=$(echo "$NONCE_RES" | jq -r '.message')

echo ""
echo "=== STEP 2: Sign message ==="
SIGNATURE=$(node -e "
const { Wallet } = require('ethers');
new Wallet('$PRIVATE_KEY').signMessage(\`$MESSAGE\`).then(s => console.log(s));
")
echo "Signature: $SIGNATURE"

echo ""
echo "=== STEP 3: Verify → get JWT ==="
VERIFY_RES=$(curl -s -X POST "$BASE_URL/api/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"wallet\":\"$WALLET\",\"signature\":\"$SIGNATURE\",\"nonce\":\"$NONCE\"}")
echo "$VERIFY_RES" | jq
JWT=$(echo "$VERIFY_RES" | jq -r '.token')

echo ""
echo "=== STEP 5: Get QR ==="
QR_RES=$(curl -s "$BASE_URL/api/destinations/1/qr")
QR_TOKEN=$(echo "$QR_RES" | jq -r '.token')
echo "QR Token: $QR_TOKEN"

echo ""
echo "=== STEP 6: Check-in ==="
curl -s -X POST "$BASE_URL/api/checkin" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{\"qrToken\":\"$QR_TOKEN\"}" | jq

echo ""
echo "=== STEP 7: Verify balance ==="
curl -s -H "Authorization: Bearer $JWT" "$BASE_URL/api/me" | jq

echo ""
echo "=== STEP 8: Lihat badges ==="
curl -s -H "Authorization: Bearer $JWT" "$BASE_URL/api/me/badges" | jq
```

Run:
```bash
chmod +x test-flow.sh
./test-flow.sh
```

⚠️ **Pre-requisite:**
- Backend running di port 4000
- Hardhat node running di port 8545
- Contracts deployed
- User sudah mint TouristPass (Step 4 dulu manual via FE atau hardhat console)
- `jq` installed (`brew install jq`)

---

## 🔗 See Also

| Dokumen | Untuk |
|:---|:---|
| [GETTING_STARTED.md](GETTING_STARTED.md) | 🚀 Setup pre-requisite sebelum jalankan test ini |
| [USER_FLOW.md](USER_FLOW.md) | 🛣️ Konteks bisnis tiap endpoint (visual flow) |
| [BACKEND.md](BACKEND.md) | 🌐 Detail teknis endpoint, schema, error codes |
| [SMART_CONTRACTS.md](SMART_CONTRACTS.md) | 📜 Apa yang di-trigger on-chain di balik endpoint |
| [FRONTEND.md](FRONTEND.md) | 🎨 Frontend yang juga call endpoint ini |

---

<div align="center">

### 📜 *Document End*

**API Flow Documentation — Ready for Demo**

<sub>🎯 9 endpoints · 4 phases · Full check-in cycle from auth → reward</sub>

</div>
