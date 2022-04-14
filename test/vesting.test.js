const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Vesting", function () {

  let admin;
  let advisor;
  let token;
  let vesting;

  beforeEach(async function () {
    // getting admin address
    [admin, advisor] = await ethers.getSigners();

    // Deploying Vest token 
    const VestToken = await ethers.getContractFactory("VestToken");
    token = await VestToken.deploy();
    await token.deployed();

    // deploying TokenVesting contract
    const TokenVesting = await ethers.getContractFactory("TokenVesting");
    vesting = await TokenVesting.deploy(token.address);
    await vesting.deployed();

  });

  describe("Vest Token", function () {
    it("Should approve token spend", async function () {
      // Approving token spend
      const tokenTotalSupply = await token.totalSupply();
      const tokenTotalSuppyBigNo = tokenTotalSupply.toString();
      const approveToken = await token.approve(vesting.address, ethers.BigNumber.from(tokenTotalSuppyBigNo));
      await approveToken.wait();
      expect(await token.allowance(admin.address, vesting.address)).to.equal(ethers.BigNumber.from(tokenTotalSuppyBigNo));
    })
  })

  describe("Vesting Smart Contract", function () {

    it("Should create vesting", async function () {
      // create vesting
      const roles = [0, 1, 2]; // Advisor (0), Partnerships(1), Mentors(2)
      const createVesting = await vesting.createVesting(roles[0], advisor.address, 0, 12);
      await createVesting.wait();
      expect(await vesting.isVested(advisor.address)).to.equal(true);

    })

    it("Should release vesting", async function () {

      // Approving token spend
      const tokenTotalSupply = await token.totalSupply();
      const tokenTotalSuppyBigNo = tokenTotalSupply.toString();
      const approveToken = await token.approve(vesting.address, ethers.BigNumber.from(tokenTotalSuppyBigNo));
      await approveToken.wait();
      expect(await token.allowance(admin.address, vesting.address)).to.equal(ethers.BigNumber.from(tokenTotalSuppyBigNo));

      // create vesting
      const roles = [0, 1, 2]; // Advisor (0), Partnerships(1), Mentors(2)
      const createVesting = await vesting.createVesting(roles[0], advisor.address, 0, 12);
      await createVesting.wait();
      expect(await vesting.isVested(advisor.address)).to.equal(true);

      // release vesting
      const releaseVesting = await vesting.releaseVesting(advisor.address);
      await releaseVesting.wait();
      expect(await vesting.isVested(admin.address)).to.equal(false);
    })

    it("Should get vested token rewards", async function () {

      // Approving token spend
      const tokenTotalSupply = await token.totalSupply();
      const tokenTotalSuppyBigNo = tokenTotalSupply.toString();
      const approveToken = await token.approve(vesting.address, ethers.BigNumber.from(tokenTotalSuppyBigNo));
      await approveToken.wait();
      expect(await token.allowance(admin.address, vesting.address)).to.equal(ethers.BigNumber.from(tokenTotalSuppyBigNo));

      // create vesting
      const roles = [0, 1, 2]; // Advisor (0), Partnerships(1), Mentors(2)
      // Created Vesting with no cliff 
      const createVesting = await vesting.createVesting(roles[0], advisor.address, 0, 12);
      await createVesting.wait();
      expect(await vesting.isVested(advisor.address)).to.equal(true);

      // release vesting
      const releaseVesting = await vesting.releaseVesting(advisor.address);
      await releaseVesting.wait();
      expect(await vesting.isVested(admin.address)).to.equal(false);

      // check vested token rewards
      const balanceOfAdvisor = await token.balanceOf(advisor.address);
      expect(await balanceOfAdvisor).to.equal(ethers.BigNumber.from("454545454545454545454545"));
    })

    it("Should not receive vested token rewards before cliff", async function () {

      // Approving token spend
      const tokenTotalSupply = await token.totalSupply();
      const tokenTotalSuppyBigNo = tokenTotalSupply.toString();
      const approveToken = await token.approve(vesting.address, ethers.BigNumber.from(tokenTotalSuppyBigNo));
      await approveToken.wait();
      expect(await token.allowance(admin.address, vesting.address)).to.equal(ethers.BigNumber.from(tokenTotalSuppyBigNo));
  
      // create vesting
      const roles = [0, 1, 2]; // Advisor (0), Partnerships(1), Mentors(2)
      // Created Vesting with 2 months of cliff 
      const createVesting = await vesting.createVesting(roles[0], advisor.address, 2, 12);
      await createVesting.wait();
      expect(await vesting.isVested(advisor.address)).to.equal(true);
  
      // release vesting
      const releaseVesting = await vesting.releaseVesting(advisor.address);
      await releaseVesting.wait();
      expect(await vesting.isVested(admin.address)).to.equal(false);
  
      // check vested token rewards
      const balanceOfAdvisor = await token.balanceOf(advisor.address);
      expect(await balanceOfAdvisor).to.equal(ethers.BigNumber.from("0"));
    })
  })
});
