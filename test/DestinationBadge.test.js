const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("DestinationBadge", function () {
  let badge;
  let owner;
  let user1;
  let user2;

  const BOROBUDUR = 1;
  const BROMO = 2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const DestinationBadge = await ethers.getContractFactory(
      "DestinationBadge"
    );
    badge = await DestinationBadge.deploy();
    await badge.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sets correct name and symbol", async function () {
      expect(await badge.name()).to.equal("TravelVerse Badge");
      expect(await badge.symbol()).to.equal("TVB");
    });

    it("sets deployer as owner", async function () {
      expect(await badge.owner()).to.equal(owner.address);
    });
  });

  describe("mintBadge — access control & validation", function () {
    it("reverts if non-owner calls", async function () {
      await expect(
        badge.connect(user1).mintBadge(user1.address, BOROBUDUR)
      ).to.be.revertedWithCustomError(badge, "OwnableUnauthorizedAccount");
    });

    it("reverts if user is zero address", async function () {
      await expect(
        badge.mintBadge(ethers.ZeroAddress, BOROBUDUR)
      ).to.be.revertedWith("DestinationBadge: zero address");
    });
  });

  describe("mintBadge — happy path", function () {
    it("mints NFT to user", async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      expect(await badge.balanceOf(user1.address)).to.equal(1n);
      expect(await badge.ownerOf(1)).to.equal(user1.address);
    });

    it("stores destinationId in badge data", async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      const data = await badge.badgeData(1);
      expect(data.destinationId).to.equal(BigInt(BOROBUDUR));
      expect(data.mintedAt).to.be.gt(0n);
    });

    it("emits BadgeMinted event", async function () {
      await expect(badge.mintBadge(user1.address, BOROBUDUR))
        .to.emit(badge, "BadgeMinted")
        .withArgs(user1.address, BOROBUDUR, 1, anyValue);
    });

    it("auto-increments tokenId", async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      await badge.mintBadge(user1.address, BROMO);
      expect(await badge.totalSupply()).to.equal(2n);
    });
  });

  describe("Anti-double-claim", function () {
    it("reverts if claimed at same destination today", async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      await expect(
        badge.mintBadge(user1.address, BOROBUDUR)
      ).to.be.revertedWith("DestinationBadge: already claimed today");
    });

    it("allows different destinations on same day", async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      await badge.mintBadge(user1.address, BROMO);
      expect(await badge.balanceOf(user1.address)).to.equal(2n);
    });

    it("allows same destination next day", async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      await network.provider.send("evm_increaseTime", [86400]);
      await network.provider.send("evm_mine");
      await badge.mintBadge(user1.address, BOROBUDUR);
      expect(await badge.balanceOf(user1.address)).to.equal(2n);
    });

    it("isolates claim limit per user", async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      await badge.mintBadge(user2.address, BOROBUDUR);
      expect(await badge.balanceOf(user1.address)).to.equal(1n);
      expect(await badge.balanceOf(user2.address)).to.equal(1n);
    });
  });

  describe("View helpers", function () {
    beforeEach(async function () {
      await badge.mintBadge(user1.address, BOROBUDUR);
      await badge.mintBadge(user1.address, BROMO);
    });

    it("getUserBadges returns all tokenIds", async function () {
      const tokens = await badge.getUserBadges(user1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(1n);
      expect(tokens[1]).to.equal(2n);
    });

    it("getBadgesAtDestination filters by destination", async function () {
      const tokens = await badge.getBadgesAtDestination(
        user1.address,
        BOROBUDUR
      );
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(1n);
    });

    it("canClaimToday returns false after claim", async function () {
      expect(await badge.canClaimToday(user1.address, BOROBUDUR)).to.be.false;
    });

    it("canClaimToday returns true for new destination", async function () {
      expect(await badge.canClaimToday(user1.address, 999)).to.be.true;
    });

    it("canClaimToday returns true next day", async function () {
      await network.provider.send("evm_increaseTime", [86400]);
      await network.provider.send("evm_mine");
      expect(await badge.canClaimToday(user1.address, BOROBUDUR)).to.be.true;
    });
  });
});
