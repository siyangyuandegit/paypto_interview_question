import {setBalance} from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import keccak256 from "keccak256";
export { createContractConnect, getProof };


async function createContractConnect(contract, address) {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  let user_ = await ethers.getSigner(address);
  setBalance(address, 1e18);
  let contractConnected = await contract.connect(user_);
  return contractConnected;
}
async function getProof(tree, address) {
  var proof = tree.getHexProof(keccak256(address));
  return proof;
}
