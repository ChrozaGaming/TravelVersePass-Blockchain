const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("TouristPass", function () {
  let touristPass;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const TouristPass = await ethers.getContractFactory("TouristPass");
    touristPass = await TouristPass.deploy();
    await touristPass.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sets correct name and symbol", async function () {
      expect(await touristPass.name()).to.equal("TravelVerse Pass");
      expect(await touristPass.symbol()).to.equal("TVP");
    });

    it("sets deployer as owner", async function () {
      expect(await touristPass.owner()).to.equal(owner.address);
    });

    it("starts with totalSupply = 0", async function () {
      expect(await touristPass.totalSupply()).to.equal(0n);
    });
  });

  describe("mintPass", function () {
    it("mints 1 NFT to user", async function () {
      await touristPass.connect(user1).mintPass("Hilmy");
      expect(await touristPass.balanceOf(user1.address)).to.equal(1n);
      expect(await touristPass.hasMinted(user1.address)).to.be.true;
      expect(await touristPass.walletToToken(user1.address)).to.equal(1n);
    });

    it("reverts if user already minted", async function () {
      await touristPass.connect(user1).mintPass("Hilmy");
      await expect(
        touristPass.connect(user1).mintPass("Hilmy2")
      ).to.be.revertedWith("TouristPass: already minted");
    });

    it("reverts if username empty", async function () {
      await expect(
        touristPass.connect(user1).mintPass("")
      ).to.be.revertedWith("TouristPass: username required");
    });

    it("reverts if username too long (>32 chars)", async function () {
      const longName = "a".repeat(33);
      await expect(
        touristPass.connect(user1).mintPass(longName)
      ).to.be.revertedWith("TouristPass: username too long");
    });

    it("initializes pass data correctly", async function () {
      await touristPass.connect(user1).mintPass("Hilmy");
      const data = await touristPass.getPassByWallet(user1.address);
      expect(data.username).to.equal("Hilmy");
      expect(data.level).to.equal("Beginner");
      expect(data.visitedCount).to.equal(0n);
      expect(data.mintedAt).to.be.gt(0n);
    });

    it("emits PassMinted event", async function () {
      await expect(touristPass.connect(user1).mintPass("Hilmy"))
        .to.emit(touristPass, "PassMinted")
        .withArgs(user1.address, 1, "Hilmy", anyValue);
    });

    it("auto-increments tokenId across multiple users", async function () {
      await touristPass.connect(user1).mintPass("Hilmy");
      await touristPass.connect(user2).mintPass("Bagus");
      expect(await touristPass.walletToToken(user1.address)).to.equal(1n);
      expect(await touristPass.walletToToken(user2.address)).to.equal(2n);
      expect(await touristPass.totalSupply()).to.equal(2n);
    });
  });

  describe("incrementVisit", function () {
    beforeEach(async function () {
      await touristPass.connect(user1).mintPass("Hilmy");
    });

    it("only owner can call", async function () {
      await expect(
        touristPass.connect(user1).incrementVisit(user1.address)
      ).to.be.revertedWithCustomError(touristPass, "OwnableUnauthorizedAccount");
    });

    it("reverts if user has no pass", async function () {
      await expect(
        touristPass.incrementVisit(user2.address)
      ).to.be.revertedWith("TouristPass: user has no pass");
    });

    it("increments visitedCount", async function () {
      await touristPass.incrementVisit(user1.address);
      const data = await touristPass.getPassByWallet(user1.address);
      expect(data.visitedCount).to.equal(1n);
    });

    it("emits VisitIncremented event", async function () {
      await expect(touristPass.incrementVisit(user1.address))
        .to.emit(touristPass, "VisitIncremented")
        .withArgs(user1.address, 1, 1);
    });

    it("stays at Beginner for visits 0-5", async function () {
      for (let i = 0; i < 5; i++) {
        await touristPass.incrementVisit(user1.address);
      }
      const data = await touristPass.getPassByWallet(user1.address);
      expect(data.level).to.equal("Beginner");
      expect(data.visitedCount).to.equal(5n);
    });

    it("levels up to Explorer at visit 6", async function () {
      for (let i = 0; i < 5; i++) {
        await touristPass.incrementVisit(user1.address);
      }
      await expect(touristPass.incrementVisit(user1.address))
        .to.emit(touristPass, "LevelUp")
        .withArgs(user1.address, 1, "Beginner", "Explorer");
      const data = await touristPass.getPassByWallet(user1.address);
      expect(data.level).to.equal("Explorer");
    });

    it("levels up to Adventurer at visit 21", async function () {
      for (let i = 0; i < 21; i++) {
        await touristPass.incrementVisit(user1.address);
      }
      const data = await touristPass.getPassByWallet(user1.address);
      expect(data.level).to.equal("Adventurer");
    });

    it("levels up to Legendary at visit 50", async function () {
      for (let i = 0; i < 50; i++) {
        await touristPass.incrementVisit(user1.address);
      }
      const data = await touristPass.getPassByWallet(user1.address);
      expect(data.level).to.equal("Legendary Traveler");
    });

    it("does NOT emit LevelUp if level unchanged", async function () {
      await touristPass.incrementVisit(user1.address);
      await expect(touristPass.incrementVisit(user1.address)).to.not.emit(
        touristPass,
        "LevelUp"
      );
    });
  });

  describe("getPassByWallet", function () {
    it("reverts for wallet without pass", async function () {
      await expect(
        touristPass.getPassByWallet(user1.address)
      ).to.be.revertedWith("TouristPass: no pass for this wallet");
    });
  });
});

