// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "hardhat/console.sol";

interface MING_ {
    function claim(address, bytes32[] calldata) external;
    function test() external;
}

contract Airdrop {
    address public implementation;

    constructor(address implementation_) {
        implementation = implementation_;
    }

    function claim(bytes32[] calldata proof) public {
        // try MING_(implementation).claim(msg.sender, proof) {}
        // catch Error(string memory reason) {
        //     revert(reason);
        // } catch (bytes memory returnData) {}

        // use assembly to save
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
