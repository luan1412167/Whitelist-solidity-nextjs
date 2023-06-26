// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Whitelist {
    uint8 public maxWhitelistAddresses;
    mapping(address => bool) public whitelistAddresses;
    uint8 public numAddressesWhitelisted;

    constructor (uint8 _maxWhitelistAdresses)
    {
        maxWhitelistAddresses = _maxWhitelistAdresses;
    }

    function addAddressToWhitelist() public {
        require(!whitelistAddresses[msg.sender], "Sender has adready been whitelisted");
        require(numAddressesWhitelisted < maxWhitelistAddresses, "Num addresses can not be more max supply");
        whitelistAddresses[msg.sender] = true;
        numAddressesWhitelisted += 1;
    }
}