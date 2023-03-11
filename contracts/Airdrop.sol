// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Airdrop {
    address public implementation;

    constructor(address implementation_) {
        implementation = implementation_;
    }

    function claim(bytes32[] calldata proof) public {
        // use assembly to save gas
        (bool success, bytes memory data) =
            implementation.call(abi.encodeWithSignature("claim(address,bytes32[])", msg.sender, proof));
        if(!success){
            assembly {
                data := add(data, 0x04)
            }
            revert (abi.decode(data, (string)));
        }
    }


}
