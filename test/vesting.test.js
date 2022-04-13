const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Vesting", function () {

  let admin;
  let token;
  let vesting;

  beforeEach(async function () {
    // getting admin address
    [admin] = await ethers.getSigners();

    // Deploying Vest token 
    const VestToken = await ethers.getContractFactory("VestToken");
    token = await VestToken.deploy();
    await token.deployed();

    // deploying TokenVesting contract
    const TokenVesting = await ethers.getContractFactory("TokenVesting");
    vesting = await TokenVesting.deploy(vestToken.address);
    await vesting.deployed();

  });

  describe("Vest Token", function () {
    it("Should approve token spend", async function () {
      // Approving token spend
      const approveToken = await token.approve(vesting.address, token.totalSupply());
      await approveToken.wait();
      expect(await token.allowance(admin.address, vesting.address)).to.equal(10000000);
    })
  })
});
