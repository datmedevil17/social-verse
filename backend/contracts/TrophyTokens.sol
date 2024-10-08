// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TrophyTokens is ERC20 {

    address public owner;

    constructor() ERC20("TrophyToken", "TROPHY") {}

    function mintTrophies(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
