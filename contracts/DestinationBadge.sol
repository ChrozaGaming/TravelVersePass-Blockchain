// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TravelVerse Destination Badge (ERC-721)
/// @author Hilmy Raihan Alkindy
/// @notice Badge NFT collectible per destinasi wisata. Di-mint oleh
///         backend (onlyOwner) setelah user berhasil scan QR di lokasi.
/// @dev    1 claim per user per destinasi per hari (anti-farming).
contract DestinationBadge is ERC721, Ownable {
    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    uint256 private _nextTokenId = 1;

    struct BadgeData {
        uint256 destinationId;
        uint256 mintedAt;
    }

    /// @notice Data badge per tokenId.
    mapping(uint256 => BadgeData) public badgeData;

    /// @notice Hari terakhir user claim badge di destinasi tertentu.
    ///         Disimpan sebagai `block.timestamp / 1 days`.
    mapping(address => mapping(uint256 => uint256)) public lastClaimDay;

    /// @notice Daftar semua tokenId yang dimiliki user.
    mapping(address => uint256[]) private _userBadges;

    /// @notice Daftar tokenId user untuk destinasi tertentu.
    mapping(address => mapping(uint256 => uint256[]))
        private _userBadgesByDest;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event BadgeMinted(
        address indexed user,
        uint256 indexed destinationId,
        uint256 indexed tokenId,
        uint256 timestamp
    );

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor()
        ERC721("TravelVerse Badge", "TVB")
        Ownable(msg.sender)
    {}

    // ---------------------------------------------------------------------
    // External — Owner (Backend)
    // ---------------------------------------------------------------------

    /// @notice Mint badge NFT untuk user di destinasi tertentu.
    /// @dev    Dipanggil backend setelah QR + lokasi tervalidasi.
    /// @param user Wallet address user yang check-in.
    /// @param destinationId ID destinasi wisata (mapping ke off-chain DB).
    /// @return tokenId Token ID yang baru di-mint.
    function mintBadge(address user, uint256 destinationId)
        external
        onlyOwner
        returns (uint256 tokenId)
    {
        require(user != address(0), "DestinationBadge: zero address");

        uint256 today = block.timestamp / 1 days;
        require(
            lastClaimDay[user][destinationId] < today,
            "DestinationBadge: already claimed today"
        );

        tokenId = _nextTokenId++;
        _safeMint(user, tokenId);

        badgeData[tokenId] = BadgeData({
            destinationId: destinationId,
            mintedAt: block.timestamp
        });
        lastClaimDay[user][destinationId] = today;
        _userBadges[user].push(tokenId);
        _userBadgesByDest[user][destinationId].push(tokenId);

        emit BadgeMinted(user, destinationId, tokenId, block.timestamp);
    }

    // ---------------------------------------------------------------------
    // View Helpers
    // ---------------------------------------------------------------------

    /// @notice Semua tokenId badge yang dimiliki user.
    function getUserBadges(address user)
        external
        view
        returns (uint256[] memory)
    {
        return _userBadges[user];
    }

    /// @notice Semua tokenId badge user di destinasi tertentu.
    function getBadgesAtDestination(address user, uint256 destinationId)
        external
        view
        returns (uint256[] memory)
    {
        return _userBadgesByDest[user][destinationId];
    }

    /// @notice Cek apakah user masih bisa claim badge di destinasi hari ini.
    function canClaimToday(address user, uint256 destinationId)
        external
        view
        returns (bool)
    {
        return lastClaimDay[user][destinationId] < block.timestamp / 1 days;
    }

    /// @notice Total badge yang sudah pernah di-mint.
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
