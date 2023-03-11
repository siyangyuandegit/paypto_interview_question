// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract MING is ERC20 {

    uint256 constant CLAIM_NUM = 10000 ether;
    bytes32 public root;
    mapping(address => bool) private claimed;
    event Claim(address indexed to, uint256 value);
    constructor(bytes32 root_, string memory name_, string memory symbol_) ERC20(name_, symbol_){
        root = root_;
    }

    // Check for eligibility
    modifier isWhiteListed(address user, bytes32[] calldata proof) {
        require(MerkleProof.verifyCalldata(proof, root, keccak256(abi.encodePacked(user))), "Not WiteListed");
        _;
    }


    function claim(address user, bytes32[] calldata proof) public isWhiteListed(user, proof){
        // Preventing reentry
        require(claimed[user] == false, "Already claimed");
        // check the totalSupply 
        require(totalSupply() + CLAIM_NUM <= 1000000 ether, "Exceeds maximum supply");
        claimed[user] = true;
        _mint(user, CLAIM_NUM);
        emit Claim(user, CLAIM_NUM);
    }
}