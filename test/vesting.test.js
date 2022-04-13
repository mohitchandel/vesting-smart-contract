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
    vesting = await TokenVesting.deploy(token.address);
    await vesting.deployed();

  });

  describe("Vest Token", function () {
    it("Should approve token spend", async function () {
      // Approving token spend
      const approveToken = await token.approve(vesting.address, 100000000);
      await approveToken.wait();
      expect(await token.allowance(admin.address, vesting.address)).to.equal(100000000);
    })
  })

  describe("Vesting", function () {
    it("Should create vesting", async function () {
      // create vesting
      const roles = [0,1,2]; // Advisor (0), Partnerships(1), Mentors(2)
      const createVesting = await vesting.createVesting(roles[0], admin.address);
      await createVesting.wait();
      expect(await vesting.isVested(admin.address)).to.equal(true);
      
    })

    it("Should release vesting", async function () {
      // create vesting
      const roles = [0,1,2]; // Advisor (0), Partnerships(1), Mentors(2)
      const createVesting = await vesting.createVesting(roles[0], admin.address);
      await createVesting.wait();
      expect(await vesting.isVested(admin.address)).to.equal(true);
      
      // release vesting
      const vestedData = await vesting.vested(1);
      if(vestedData.cliff.toNumber() <= (Date.now()/1000)){
        const releaseVesting = await vesting.releaseVesting(vestId);
        await releaseVesting.wait();
        expect(await vesting.isVested(admin.address)).to.equal(false);
      }else{
        console.log("Not allowed to release before cliff")
      }
    })
  })
});
