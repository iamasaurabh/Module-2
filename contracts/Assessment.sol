 // SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    struct House {
        bool isRented;
        uint256 rentAmount;
        uint256 leaseDuration; // Lease duration in months
        address tenant;
    }

    mapping(address => House) public houses;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event HouseRented(address indexed tenant, uint256 rentAmount, uint256 leaseDuration);
    event HouseLeased(address indexed landlord, uint256 rentAmount, uint256 leaseDuration);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    // Custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function rentHouse(address _tenant, uint256 _rentAmount, uint256 _leaseDuration) public {
        require(msg.sender == owner, "You are not the owner of this house");
        require(!houses[_tenant].isRented, "House is already rented");
        houses[_tenant] = House(true, _rentAmount, _leaseDuration, _tenant);
        emit HouseRented(_tenant, _rentAmount, _leaseDuration);
    }

    function leaseHouse(address _landlord, uint256 _rentAmount, uint256 _leaseDuration) public {
        require(msg.sender == _landlord, "You are not the landlord of this house");
        require(!houses[_landlord].isRented, "House is already rented");
        houses[_landlord] = House(true, _rentAmount, _leaseDuration, _landlord);
        emit HouseLeased(_landlord, _rentAmount, _leaseDuration);
    }
}
