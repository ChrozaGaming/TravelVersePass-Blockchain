const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardToken", function () {
  let token;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const RewardToken = await ethers.getContractFactory("RewardToken");
    token = await RewardToken.deploy();
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sets correct name, symbol, decimals", async function () {
      expect(await token.name()).to.equal("TravelVerse Token");
      expect(await token.symbol()).to.equal("TVT");
      expect(await token.decimals()).to.equal(18n);
    });

    it("sets deployer as owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("mints initial supply to contract itself", async function () {
      const contractAddr = await token.getAddress();
      expect(await token.balanceOf(contractAddr)).to.equal(
        ethers.parseEther("1000000")
      );
      expect(await token.totalSupply()).to.equal(
        ethers.parseEther("1000000")
      );
    });

    it("exposes CHECKIN_REWARD and LEVEL_UP_BONUS constants", async function () {
      expect(await token.CHECKIN_REWARD()).to.equal(ethers.parseEther("10"));
      expect(await token.LEVEL_UP_BONUS()).to.equal(ethers.parseEther("200"));
    });
  });

  describe("rewardCheckin", function () {
    it("transfers 10 TVT to user", async function () {
      await token.rewardCheckin(user1.address);
      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("10")
      );
    });

    it("reverts if non-owner calls", async function () {
      await expect(
        token.connect(user1).rewardCheckin(user1.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("reverts if user is zero address", async function () {
      await expect(
        token.rewardCheckin(ethers.ZeroAddress)
      ).to.be.revertedWith("RewardToken: zero address");
    });

    it("emits Rewarded event with 'check-in' reason", async function () {
      await expect(token.rewardCheckin(user1.address))
        .to.emit(token, "Rewarded")
        .withArgs(user1.address, ethers.parseEther("10"), "check-in");
    });

    it("decreases pool balance", async function () {
      const contractAddr = await token.getAddress();
      const before = await token.balanceOf(contractAddr);
      await token.rewardCheckin(user1.address);
      const after = await token.balanceOf(contractAddr);
      expect(before - after).to.equal(ethers.parseEther("10"));
    });
  });

  describe("rewardLevelUp", function () {
    it("transfers 200 TVT bonus", async function () {
      await token.rewardLevelUp(user1.address);
      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("200")
      );
    });

    it("emits Rewarded event with 'level-up' reason", async function () {
      await expect(token.rewardLevelUp(user1.address))
        .to.emit(token, "Rewarded")
        .withArgs(user1.address, ethers.parseEther("200"), "level-up");
    });
  });

  describe("rewardCustom", function () {
    it("transfers custom amount with reason", async function () {
      const amount = ethers.parseEther("50");
      await expect(
        token.rewardCustom(user1.address, amount, "special-event")
      )
        .to.emit(token, "Rewarded")
        .withArgs(user1.address, amount, "special-event");
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("reverts if amount is 0", async function () {
      await expect(
        token.rewardCustom(user1.address, 0, "test")
      ).to.be.revertedWith("RewardToken: amount must be > 0");
    });

    it("reverts if amount exceeds pool", async function () {
      const huge = ethers.parseEther("2000000");
      await expect(
        token.rewardCustom(user1.address, huge, "test")
      ).to.be.revertedWith("RewardToken: insufficient pool");
    });
  });

  describe("Standard ERC-20 behavior", function () {
    it("user can transfer their tokens", async function () {
      await token.rewardCheckin(user1.address);
      await token.connect(user1).transfer(user2.address, ethers.parseEther("3"));
      expect(await token.balanceOf(user2.address)).to.equal(
        ethers.parseEther("3")
      );
    });
  });
});
