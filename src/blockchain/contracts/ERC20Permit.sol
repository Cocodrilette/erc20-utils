// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "solmate/src/tokens/ERC20.sol";

contract ERC20Permit is ERC20 {
    constructor() ERC20("Test Permit", "Test Permit", 18) {}
}
