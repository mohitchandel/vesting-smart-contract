async function main() {
  // Deploying Vest token 
  const VestToken = await ethers.getContractFactory("VestToken");
  token = await VestToken.deploy();
  await token.deployed();

  // deploying TokenVesting contract
  const TokenVesting = await ethers.getContractFactory("TokenVesting");
  vesting = await TokenVesting.deploy(token.address);
  await vesting.deployed();

  console.log("Token deployed to:", token.address);
  console.log("Vesting contract deployed to:", vesting.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });