// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TravelVerse Pass — Digital Travel Identity (ERC-721)
/// @author Hilmy Raihan Alkindy
/// @notice Identitas wisata digital. 1 NFT per wallet, menyimpan
///         username, level traveler, dan jumlah destinasi yang dikunjungi.
/// @dev    Level di-update otomatis di on-chain saat `incrementVisit`
///         dipanggil oleh owner (backend signer).
contract TouristPass is ERC721, Ownable {
    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    uint256 private _nextTokenId = 1;

    struct PassData {
        string username;
        string level;
        uint256 visitedCount;
        uint256 mintedAt;
    }

    /// @notice Data pass per tokenId.
    mapping(uint256 => PassData) public passData;

    /// @notice Lookup tokenId dari wallet address.
    mapping(address => uint256) public walletToToken;

    /// @notice True jika wallet sudah pernah mint pass.
    mapping(address => bool) public hasMinted;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event PassMinted(
        address indexed user,
        uint256 indexed tokenId,
        string username,
        uint256 timestamp
    );

    event VisitIncremented(
        address indexed user,
        uint256 indexed tokenId,
        uint256 newCount
    );

    event LevelUp(
        address indexed user,
        uint256 indexed tokenId,
        string oldLevel,
        string newLevel
    );

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor() ERC721("TravelVerse Pass", "TVP") Ownable(msg.sender) {}

    // ---------------------------------------------------------------------
    // External — User
    // ---------------------------------------------------------------------

    /// @notice Mint 1 NFT pass untuk wallet pemanggil. Hanya bisa sekali.
    /// @param username Display name traveler (1-32 chars dianjurkan).
    function mintPass(string calldata username) external {
        require(!hasMinted[msg.sender], "TouristPass: already minted");
        require(bytes(username).length > 0, "TouristPass: username required");
        require(bytes(username).length <= 32, "TouristPass: username too long");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        passData[tokenId] = PassData({
            username: username,
            level: "Beginner",
            visitedCount: 0,
            mintedAt: block.timestamp
        });
        walletToToken[msg.sender] = tokenId;
        hasMinted[msg.sender] = true;

        emit PassMinted(msg.sender, tokenId, username, block.timestamp);
    }

    // ---------------------------------------------------------------------
    // External — Owner (Backend)
    // ---------------------------------------------------------------------

    /// @notice Tambah 1 ke visitedCount user dan update level kalau perlu.
    /// @dev    Dipanggil backend setelah QR check-in tervalidasi.
    /// @param user Wallet address user yang baru saja check-in.
    function incrementVisit(address user) external onlyOwner {
        require(hasMinted[user], "TouristPass: user has no pass");

        uint256 tokenId = walletToToken[user];
        string memory oldLevel = passData[tokenId].level;

        unchecked {
            passData[tokenId].visitedCount += 1;
        }
        uint256 newCount = passData[tokenId].visitedCount;
        emit VisitIncremented(user, tokenId, newCount);

        string memory newLevel = _calculateLevel(newCount);
        if (keccak256(bytes(oldLevel)) != keccak256(bytes(newLevel))) {
            passData[tokenId].level = newLevel;
            emit LevelUp(user, tokenId, oldLevel, newLevel);
        }
    }

    // ---------------------------------------------------------------------
    // View Helpers
    // ---------------------------------------------------------------------

    /// @notice Ambil seluruh data pass dari wallet address.
    function getPassByWallet(address wallet)
        external
        view
        returns (PassData memory)
    {
        require(hasMinted[wallet], "TouristPass: no pass for this wallet");
        return passData[walletToToken[wallet]];
    }

    /// @notice Total pass yang sudah pernah di-mint (= tokenId terakhir).
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ---------------------------------------------------------------------
    // Internal
    // ---------------------------------------------------------------------

    function _calculateLevel(uint256 count)
        internal
        pure
        returns (string memory)
    {
        if (count >= 50) return "Legendary Traveler";
        if (count >= 21) return "Adventurer";
        if (count >= 6) return "Explorer";
        return "Beginner";
    }
}
