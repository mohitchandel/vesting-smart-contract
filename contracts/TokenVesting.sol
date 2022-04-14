// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./VestToken.sol";

contract TokenVesting {
    address admin;
    VestToken token;
    uint256 totalTokens;

    enum vestingRoles {
        Advisor,
        Partnerships,
        Mentors
    }
    struct Vesting {
        vestingRoles role;
        address beneficiary;
        uint256 cliff;
        uint256 startTime;
        uint256 timeDuration;
        uint256 amountAfterVesting;
        uint16 totalAmountPercent;
    }

    mapping(address => Vesting) public vested;

    constructor(VestToken _tokenAddress) {
        admin = msg.sender;
        token = _tokenAddress;
        totalTokens = token.totalSupply();
    }

    // Creating Vesting
    function createVesting(
        vestingRoles _role,
        address _beneficiary,
        uint256 _cliffMonths,
        uint256 _vestingMonths
    ) external onlyAdmin {
        require(
            _role <= vestingRoles.Mentors,
            "Only roles are Advisor(0), Partnerships(1) and Mentors(2)"
        );
        uint256 _startTime = block.timestamp;
        uint256 _cliff = block.timestamp + _cliffMonths * 30 days;
        uint256 _timeDuration = block.timestamp + (_vestingMonths * 30 days);
        uint256 tokenGeneration;
        uint16 totalTokenPercent;
        if (_role == vestingRoles.Advisor) {
            totalTokenPercent = 5;
            tokenGeneration = (totalTokens * totalTokenPercent) / 100;
        } else if (_role == vestingRoles.Partnerships) {
            totalTokenPercent = 6;
            tokenGeneration = (totalTokens * totalTokenPercent) / 100;
        } else {
            totalTokenPercent = 7;
            tokenGeneration = (totalTokens * totalTokenPercent) / 100;
        }
        vested[_beneficiary] = Vesting(
            _role,
            _beneficiary,
            _cliff,
            _startTime,
            _timeDuration,
            tokenGeneration,
            totalTokenPercent
        );
    }

    // Release address vesting
    function releaseVesting(address _beneficiary) external payable {
        require(vested[_beneficiary].amountAfterVesting != 0, "Id not found");
        require(
            msg.sender == vested[_beneficiary].beneficiary ||
                msg.sender == admin,
            "not callable by other than admin or beneficiary"
        );
        address reciever = payable(vested[_beneficiary].beneficiary);
        uint256 _amount = finalTokenAmount(
            vested[_beneficiary].timeDuration,
            vested[_beneficiary].totalAmountPercent
        );
        if (vested[_beneficiary].cliff <= block.timestamp)
            token.transferFrom(admin, reciever, _amount);
        delete vested[_beneficiary];
    }

    // calculation of tokens according to the time
    function finalTokenAmount(uint256 _duration, uint16 _percent)
        internal
        view
        returns (uint256)
    {
        uint256 totalTokenAmount = token.totalSupply();
        uint256 totalMonthsLeft = ((_duration - block.timestamp) /
            60 /
            60 /
            24) / 30;
        uint256 totalAmountNow;
        if (totalMonthsLeft <= 0) {
            totalAmountNow = (totalTokenAmount * _percent) / 100;
        } else {
            totalAmountNow =
                ((totalTokenAmount * _percent) / 100) /
                totalMonthsLeft;
        }
        return totalAmountNow;
    }

    // Checking if address is already vested
    function isVested(address _beneficiary) external view returns (bool) {
        if (vested[_beneficiary].beneficiary != address(0)) return true;
        else return false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
}
