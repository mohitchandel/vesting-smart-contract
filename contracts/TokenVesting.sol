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

    uint256 vestingId;
    uint256[] allVestingIds;
    mapping(uint256 => Vesting) public vested;

    receive() external payable {}

    constructor(VestToken _tokenAddress) {
        admin = msg.sender;
        token = _tokenAddress;
        totalTokens = token.totalSupply();
    }

    function createVesting(vestingRoles _role, address _beneficiary)
        public
        onlyAdmin
    {
        require(
            _role <= vestingRoles.Mentors,
            "Only roles are Advisor(0), Partnerships(1) and Mentors(2)"
        );
        vestingId += 1;
        uint256 _startTime = block.timestamp;
        // Cliff of 2 months
        uint256 _cliff = block.timestamp + 60 days;
        // vesting time period (22 months)
        uint256 _timeDuration = block.timestamp + (22 * 30 days);
        uint256 tokenGeneration;
        uint16 totalTokenPercent;
        if (_role == vestingRoles.Advisor) {
            totalTokenPercent = 5;
            tokenGeneration = (totalTokens / totalTokenPercent) * 100;
        } else if (_role == vestingRoles.Partnerships) {
            totalTokenPercent = 6;
            tokenGeneration = (totalTokens / totalTokenPercent) * 100;
        } else {
            totalTokenPercent = 7;
            tokenGeneration = (totalTokens / totalTokenPercent) * 100;
        }
        vested[vestingId] = Vesting(
            _role,
            _beneficiary,
            _cliff,
            _startTime,
            _timeDuration,
            tokenGeneration,
            totalTokenPercent
        );
        allVestingIds.push(vestingId);
    }

    function releaseVesting(uint256 _id) public {
        require(vested[_id].beneficiary == address(0), "Id not found");
        require(
            msg.sender == vested[_id].beneficiary || msg.sender == admin,
            "not callable by other than admin or beneficiary"
        );
        require(
            vested[_id].cliff <= block.timestamp,
            "Cliff period not completed yet"
        );
        address reciever = vested[_id].beneficiary;
        uint256 _amount = finalTokenAmount(
            vested[_id].timeDuration,
            vested[_id].totalAmountPercent
        );
        token.transfer(reciever, _amount);
        delete allVestingIds[_id];
        delete vested[_id];
    }

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

    function getAllVestedId() public view returns (uint256[] memory) {
        return (allVestingIds);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
}
