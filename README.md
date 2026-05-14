# 🌍 TravelVerse Pass — Project Guide
> Tugas Akhir Mata Kuliah Blockchain | NFT Tourist Pass sebagai Digital Travel Identity

---

## 👥 Anggota Kelompok
- Ahsanta Khalqi Imany
- Andika Pratama Putra
- Bagus Setiawan
- Hilmy Raihan Alkindy

---

## 📋 Daftar Isi
1. [Overview Proyek](#1-overview-proyek)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Folder](#3-struktur-folder)
4. [Roadmap Build](#4-roadmap-build)
5. [Smart Contracts](#5-smart-contracts)
6. [Setup Environment](#6-setup-environment)
7. [Vibe Coding Prompts](#7-vibe-coding-prompts)
8. [MVP Scope](#8-mvp-scope)
9. [Tips & Catatan Penting](#9-tips--catatan-penting)

---

## 1. Overview Proyek

**TravelVerse Pass** adalah platform smart tourism berbasis blockchain yang mengubah pengalaman wisata menjadi:
- 🪙 **Collectible** — setiap kunjungan menghasilkan NFT badge
- ✅ **Terverifikasi** — tiket dan kunjungan tidak bisa dipalsukan
- 🎮 **Gamified** — sistem level dan reward token

### Masalah yang Diselesaikan
| Masalah | Solusi |
|---|---|
| Tiket mudah dipalsukan | NFT Tourist Pass (ERC-721) sebagai tiket digital |
| Tidak ada loyalty lintas destinasi | Reward Token (ERC-20) lintas destinasi |
| Pengalaman wisata monoton | Gamifikasi: level, badge, challenge |
| Tidak ada bukti perjalanan digital | Journey Timeline dari NFT collection |

---

## 2. Tech Stack

```
Frontend    →  Next.js 14 + Tailwind CSS + shadcn/ui
Blockchain  →  Solidity + Hardhat + OpenZeppelin
Wallet      →  ethers.js v6 + MetaMask
Network     →  Polygon Amoy Testnet (gratis, cepat)
Storage     →  Pinata (IPFS — free tier)
Backend     →  Next.js API Routes (built-in, tidak perlu server terpisah)
Database    →  Supabase (PostgreSQL — free tier)
```

### Kenapa Stack Ini?
- **Next.js** — handle frontend + backend sekaligus, tidak perlu Laravel/Express terpisah
- **Polygon Amoy** — gas fee gratis untuk testnet, cocok untuk demo akademik
- **Supabase** — setup 5 menit, tidak perlu konfigurasi server database
- **Hardhat** — paling banyak contohnya, AI lebih akurat generate code-nya

---

## 3. Struktur Folder

```
travelverse/
│
├── contracts/                      # Smart Contracts (Solidity)
│   ├── TouristPass.sol             # ERC-721: identitas wisata digital
│   ├── DestinationBadge.sol        # ERC-721: badge NFT per destinasi
│   └── RewardToken.sol             # ERC-20: token loyalty
│
├── scripts/                        # Hardhat scripts
│   └── deploy.js                   # Deploy semua contract sekaligus
│
├── test/                           # Unit test contract
│   └── TravelVerse.test.js
│
├── frontend/                       # Next.js App
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Traveler dashboard
│   │   ├── destinations/
│   │   │   └── page.tsx            # List destinasi wisata
│   │   ├── scan/
│   │   │   └── page.tsx            # QR scanner page
│   │   └── api/
│   │       ├── qr/route.ts         # Generate & verifikasi QR
│   │       └── verify/route.ts     # Verifikasi kunjungan
│   │
│   ├── components/
│   │   ├── WalletConnect.tsx       # Tombol connect MetaMask
│   │   ├── NFTBadgeCard.tsx        # Card tampilan badge NFT
│   │   ├── LevelProgress.tsx       # Progress bar level traveler
│   │   └── JourneyTimeline.tsx     # Timeline perjalanan
│   │
│   └── lib/
│       ├── contracts.ts            # ABI + contract address
│       ├── supabase.ts             # Supabase client
│       └── ethers.ts               # Ethers.js helper
│
├── hardhat.config.js               # Konfigurasi Hardhat + Polygon Amoy
├── .env                            # API keys (jangan di-commit!)
└── README.md
```

---

## 4. Roadmap Build

### Phase 1 — Smart Contracts *(Hari 1–3)*
```
[ ] TouristPass.sol   → ERC-721, 1 per wallet, simpan level & visited_count
[ ] DestinationBadge.sol → ERC-721, mint saat QR scan, 1 claim per hari
[ ] RewardToken.sol   → ERC-20, earned saat check-in
[ ] Deploy ke Polygon Amoy Testnet
[ ] Verifikasi di Polygonscan
```

### Phase 2 — Frontend Core *(Hari 4–7)*
```
[ ] Wallet connect MetaMask
[ ] Halaman mint Tourist Pass
[ ] Dashboard: tampilkan badge collection
[ ] Tampilkan level + progress bar
[ ] Halaman list destinasi
```

### Phase 3 — QR System *(Hari 8–9)*
```
[ ] Backend: generate QR per destinasi (signed + expiry)
[ ] Frontend: QR scanner (pakai react-qr-reader)
[ ] Verifikasi QR → trigger mint badge NFT
[ ] Supabase: simpan visit history & tx_hash
```

### Phase 4 — Polish & Presentasi *(Hari 10–11)*
```
[ ] Journey Timeline (visual koleksi perjalanan)
[ ] Level naik otomatis saat milestone tercapai
[ ] Loading state + toast notification
[ ] Responsive mobile
[ ] Demo video / slides presentasi
```

---

## 5. Smart Contracts

### 5.1 TouristPass.sol (ERC-721)
**Fungsi:** Identitas wisata digital — 1 NFT per wallet

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TouristPass is ERC721, Ownable {
    uint256 private _tokenIds;

    struct PassData {
        string username;
        string level;      // Beginner, Explorer, Adventurer, Legendary
        uint256 visitedCount;
    }

    mapping(uint256 => PassData) public passData;
    mapping(address => uint256) public walletToToken;
    mapping(address => bool) public hasMinted;

    constructor() ERC721("TravelVerse Pass", "TVP") Ownable(msg.sender) {}

    function mintPass(string memory username) public {
        require(!hasMinted[msg.sender], "Already have a pass");
        _tokenIds++;
        _safeMint(msg.sender, _tokenIds);
        passData[_tokenIds] = PassData(username, "Beginner", 0);
        walletToToken[msg.sender] = _tokenIds;
        hasMinted[msg.sender] = true;
    }

    function incrementVisit(address user) public onlyOwner {
        uint256 tokenId = walletToToken[user];
        passData[tokenId].visitedCount++;
        _updateLevel(tokenId);
    }

    function _updateLevel(uint256 tokenId) internal {
        uint256 count = passData[tokenId].visitedCount;
        if (count >= 50)      passData[tokenId].level = "Legendary Traveler";
        else if (count >= 21) passData[tokenId].level = "Adventurer";
        else if (count >= 6)  passData[tokenId].level = "Explorer";
        else                  passData[tokenId].level = "Beginner";
    }
}
```

### 5.2 DestinationBadge.sol (ERC-721)
**Fungsi:** Badge NFT collectible per destinasi wisata

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DestinationBadge is ERC721, Ownable {
    uint256 private _tokenIds;

    // user => destinationId => lastClaimDay
    mapping(address => mapping(uint256 => uint256)) public lastClaim;
    // user => destinationId => sudah pernah claim
    mapping(address => mapping(uint256 => bool)) public hasClaimed;

    event BadgeMinted(address indexed user, uint256 destinationId, uint256 tokenId);

    constructor() ERC721("TravelVerse Badge", "TVB") Ownable(msg.sender) {}

    function mintBadge(address user, uint256 destinationId) public onlyOwner {
        uint256 today = block.timestamp / 1 days;
        require(lastClaim[user][destinationId] < today, "Already claimed today");

        _tokenIds++;
        _safeMint(user, _tokenIds);
        lastClaim[user][destinationId] = today;
        hasClaimed[user][destinationId] = true;

        emit BadgeMinted(user, destinationId, _tokenIds);
    }
}
```

### 5.3 RewardToken.sol (ERC-20)
**Fungsi:** Token loyalty untuk aktivitas wisata

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    uint256 public constant CHECKIN_REWARD = 10 * 10**18; // 10 TVT per check-in

    constructor() ERC20("TravelVerse Token", "TVT") Ownable(msg.sender) {
        _mint(address(this), 1_000_000 * 10**18); // 1 juta token supply awal
    }

    function rewardUser(address user) public onlyOwner {
        _transfer(address(this), user, CHECKIN_REWARD);
    }
}
```

### 5.4 Sistem Level Traveler
```
Beginner          →  0–5 lokasi dikunjungi
Explorer          →  6–20 lokasi
Adventurer        →  21–50 lokasi
Legendary Traveler →  50+ lokasi
```

---

## 6. Setup Environment

### 6.1 Setup Hardhat
```bash
mkdir travelverse && cd travelverse
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Pilih: Create a JavaScript project

npm install @openzeppelin/contracts
```

### 6.2 Setup Next.js
```bash
npx create-next-app@latest frontend
# Pilih: TypeScript ✓ | Tailwind CSS ✓ | App Router ✓ | ESLint ✓

cd frontend
npm install ethers @supabase/supabase-js
npm install react-qr-reader qrcode
npm install @shadcn/ui
```

### 6.3 Konfigurasi Hardhat (hardhat.config.js)
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002,
    },
  },
};
```

### 6.4 File .env
```env
PRIVATE_KEY=your_metamask_private_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TOURIST_PASS_ADDRESS=deployed_contract_address
NEXT_PUBLIC_BADGE_ADDRESS=deployed_contract_address
NEXT_PUBLIC_TOKEN_ADDRESS=deployed_contract_address
QR_SECRET=your_random_secret_for_qr_signing
```

### 6.5 Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network amoy
```

### 6.6 Mendapatkan MATIC Testnet (Gratis)
1. Buka https://faucet.polygon.technology/
2. Pilih **Amoy Testnet**
3. Paste wallet address
4. Klaim MATIC gratis untuk gas fee

---

## 7. Vibe Coding Prompts

Template prompt siap pakai untuk AI (Claude/ChatGPT):

### Smart Contract
```
Buatkan Solidity smart contract ERC-721 bernama TouristPass menggunakan 
OpenZeppelin. Contract ini mint 1 NFT per wallet saat user register. 
NFT menyimpan metadata: username, level (default 'Beginner'), dan 
visited_count (default 0). Tambahkan fungsi untuk increment visited_count 
yang hanya bisa dipanggil oleh owner contract. Tambahkan juga auto-update 
level berdasarkan visited_count: 0-5 = Beginner, 6-20 = Explorer, 
21-50 = Adventurer, 50+ = Legendary Traveler.
```

### Wallet Connect Component
```
Buatkan React component di Next.js TypeScript untuk connect MetaMask wallet.
Tampilkan tombol 'Connect Wallet', setelah connect tampilkan address yang 
disingkat (0x1234...abcd) dan tombol 'Disconnect'. Gunakan ethers.js v6 
dan Tailwind CSS. Handle kasus: MetaMask tidak terinstall, user reject, 
dan network salah (harus Polygon Amoy chainId 80002).
```

### QR Generation API
```
Buatkan Next.js API Route (App Router) untuk generate QR code destinasi wisata.
QR berisi: destination_id, timestamp, dan HMAC signature menggunakan secret key.
QR expired setelah 15 menit. Gunakan library 'qrcode' untuk generate QR image.
Return QR sebagai base64 image string.
```

### QR Verifikasi & Mint Badge
```
Buatkan Next.js API Route untuk verifikasi QR scan dan trigger mint NFT badge.
Flow: terima QR data → validasi signature → cek expiry → cek user belum 
claim hari ini di Supabase → panggil smart contract mintBadge() menggunakan 
ethers.js → simpan record ke Supabase (user_wallet, destination_id, timestamp, 
tx_hash) → return sukses/gagal dengan pesan yang jelas.
```

### Dashboard Traveler
```
Buatkan halaman dashboard Next.js TypeScript untuk traveler TravelVerse Pass.
Tampilkan: nama user, level saat ini, progress bar menuju level berikutnya,
jumlah destinasi dikunjungi, saldo reward token, dan grid NFT badge yang 
dimiliki (gambar + nama destinasi). Ambil data dari smart contract menggunakan 
ethers.js v6. Gunakan Tailwind CSS dengan tema warna hijau dan biru.
```

### Journey Timeline
```
Buatkan React component Journey Timeline untuk menampilkan riwayat perjalanan 
wisata user. Data diambil dari Supabase (destination_name, visit_date, tx_hash).
Tampilkan sebagai timeline vertikal dengan tahun sebagai header, mirip travel 
passport. Setiap item tampilkan: icon destinasi, nama tempat, tanggal, dan 
link ke Polygonscan untuk lihat transaksi NFT-nya.
```

---

## 8. MVP Scope

### ✅ Wajib Ada (Minimum untuk Lulus)
- [ ] Wallet login dengan MetaMask
- [ ] Mint Tourist Pass NFT (1x per wallet)
- [ ] List destinasi wisata
- [ ] Generate & tampilkan QR per destinasi
- [ ] Scan QR → verifikasi → mint Badge NFT
- [ ] Earn Reward Token saat check-in
- [ ] Dashboard: tampilkan badge collection & level
- [ ] Deploy ke Polygon Amoy Testnet

### 🎯 Nice to Have (Nilai Plus)
- [ ] Journey Timeline visual
- [ ] Analytics sederhana (total visit, destinasi populer)
- [ ] Notifikasi level up
- [ ] Responsive mobile

### ❌ Skip Dulu (Post-MVP)
- Marketplace NFT
- AR integration
- DAO governance
- Cross-chain bridge
- Anti-GPS spoofing lanjutan

---

## 9. Tips & Catatan Penting

### ⚠️ Jangan Lupa
1. **Jangan commit `.env`** — tambahkan ke `.gitignore` dari awal
2. **Jangan pakai mainnet** — testnet Amoy gratis, mainnet pakai uang sungguhan
3. **Simpan deployed contract address** — catat setelah deploy, dibutuhkan di frontend
4. **Backup private key wallet** — jangan sampai hilang

### 🔒 Keamanan QR (untuk Presentasi)
- QR harus **dinamis** + **expired** (15 menit) — bukan QR statis
- Gunakan **HMAC signature** agar QR tidak bisa dipalsukan
- Validasi di **server-side**, bukan client-side

### 🎓 Poin Akademik yang Bisa Dibahas
- **NFT Utility** vs NFT spekulatif
- **Blockchain adoption** di sektor pariwisata Indonesia
- **Tokenomics** sederhana: supply, emission, use case
- **QR Verification Security** di sistem berbasis blockchain
- **Decentralized Identity** vs identitas tradisional
- **Gamification Economy** untuk meningkatkan retensi wisatawan

### 📚 Referensi Berguna
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
- Hardhat Docs: https://hardhat.org/docs
- Polygon Amoy Faucet: https://faucet.polygon.technology
- Pinata (IPFS): https://www.pinata.cloud
- Supabase Docs: https://supabase.com/docs
- ethers.js v6 Docs: https://docs.ethers.org/v6

---

> 💡 **Workflow Vibe Coding yang Disarankan:**
> PRD → breakdown fitur → prompt AI per komponen → review & iterasi → integrasi → demo

*Dibuat untuk keperluan Tugas Akhir Mata Kuliah Blockchain*
