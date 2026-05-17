// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TravelVerse Reward Token (ERC-20)
/// @author Hilmy Raihan Alkindy
/// @notice Token loyalty TVT untuk aktivitas wisata.
///         10 TVT per check-in, 200 TVT bonus saat level up.
/// @dev    Initial supply 1,000,000 TVT di-mint ke contract sendiri.
///         Owner (backend) transfer ke user lewat fungsi reward*.
contract RewardToken is ERC20, Ownable {
    // ---------------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------------

    /// @notice Reward standar per check-in (10 TVT).
    uint256 public constant CHECKIN_REWARD = 10 * 10 ** 18;

    /// @notice Bonus reward saat user level up (200 TVT).
    uint256 public constant LEVEL_UP_BONUS = 200 * 10 ** 18;

    /// @notice Initial supply contract (1,000,000 TVT).
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event Rewarded(
        address indexed user,
        uint256 amount,
        string reason
    );

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor()
        ERC20("TravelVerse Token", "TVT")
        Ownable(msg.sender)
    {
        _mint(address(this), INITIAL_SUPPLY);
    }

    // ---------------------------------------------------------------------
    // External — Owner (Backend)
    // ---------------------------------------------------------------------

    /// @notice Transfer 10 TVT ke user sebagai reward check-in.
    /// @param user Penerima reward.
    function rewardCheckin(address user) external onlyOwner {
        _payReward(user, CHECKIN_REWARD, "check-in");
    }

    /// @notice Transfer 200 TVT bonus saat user level up.
    /// @param user Penerima bonus.
    function rewardLevelUp(address user) external onlyOwner {
        _payReward(user, LEVEL_UP_BONUS, "level-up");
    }

    /// @notice Reward custom dengan jumlah & alasan bebas (untuk event spesial).
    /// @param user Penerima reward.
    /// @param amount Jumlah TVT (dalam wei, sudah include 18 desimal).
    /// @param reason Alasan reward, masuk ke event log.
    function rewardCustom(
        address user,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        _payReward(user, amount, reason);
    }

    // ---------------------------------------------------------------------
    // Internal
    // ---------------------------------------------------------------------

    function _payReward(
        address user,
        uint256 amount,
        string memory reason
    ) internal {
        require(user != address(0), "RewardToken: zero address");
        require(amount > 0, "RewardToken: amount must be > 0");
        require(
            balanceOf(address(this)) >= amount,
            "RewardToken: insufficient pool"
        );

        _transfer(address(this), user, amount);
        emit Rewarded(user, amount, reason);
    }
}
