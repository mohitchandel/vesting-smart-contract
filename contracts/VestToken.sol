// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VestToken is ERC20 {

    address admin;

    constructor() ERC20("Vest Token", "VST") {
        admin = msg.sender;
        _mint(admin, 100000000 *  10**decimals() );
    }

}