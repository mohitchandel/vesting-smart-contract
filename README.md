## Vesting Smart Contract

This Project is deployed on the Rinkeby testnet

ERC20 Token (Vest Token) address: [0x88f822549cB11d106b44A4cF24393514325D467D](https://rinkeby.etherscan.io/address/0x88f822549cB11d106b44A4cF24393514325D467D)


Vesting contract address: [0x5F9e921f0BDa07205D2c4E19CDc19BFacB85bA48](https://rinkeby.etherscan.io/address/0x5F9e921f0BDa07205D2c4E19CDc19BFacB85bA48)

### Usage

Before running any command, make sure to install dependencies:

`npm install`

#### Compile

Compile the smart contracts with Hardhat: 

`npx hardhat compile`

#### Test

Run the tests:

`npx hardhat test`

#### Deploy

deploy contract to netowrk: 

`npx hardhat run --network rinkeby scripts/deploy.js`


vesting smart contract will be created after the creation of ERC20 token (Vest Token), because the Staking smart contract parameters in its constructor to define the token.

`constructor(VestToken _tokenAddress) {}`

functions need to call before stacking

```
approve(address spender, uint256 amount)
``` 

this function is used to approve contract address to spend on behalf of user.

The function takes the following arguments:

- `spender`: This is the address of the spender to whom the approval rights should be given or revoked from the approver.
- `amount`: This is amount of tokens can be spend.


### How to use Vesting

In stacking smart contract function `createVesting()` is used to do Vesting of the ERC20 token.

this function has following arguments:

- `vestingRoles _role` : Where `vestingRole` is the enum created to define the 3 given roles (Advisor (0), Partnerships(1), Mentors(2))
- `address _beneficiary` : It is the address on which the vesting will be done.

#### Important components in vesting:
- `vestingRoles role` - user roles e.i. Advisor (0), Partnerships(1), Mentors(2)
- `address beneficiary` - address on which the vesting will be done.
- `uint256 cliff` - Cliff of token vesting (2 months) 
- `uint256 startTime` - time when tokens are vested
- `uint256 timeDuration` - ideal time till vesting will go on (22 months)
- `uint256 amountAfterVesting` - reward token amount will receive after vesting
- `uint16 totalAmountPercent` - reward %

When vesting is done an Id is created and that id will help to check the vesting data with the help of `vested(uint256 id)`, and to check if the particular address is already vested the function `isVested(address _beneficiary)` can be called which returns `true` or `false`, True if address is already in vested list and false when address is not vested.


### How to Release Vesting

The `releaseVesting()` function is used to complete the process of releasing the vesting created

This function is only callable by either admin or the beneficiary of the actual vesting created

This function has one parameter:
- `uint256 _id`: Id created after vesting is done
