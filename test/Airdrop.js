import { expect } from "chai";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import addresses from "../addresses.json" assert { type: "json" };
import ethers from "ethers";
import { createContractConnect } from "./utils.js";
import { getProof } from "./utils.js";

const whiteListedUserAddress = addresses.whitelist[0];
// declar a non-whitelisted address
const nonWhitelistedAddress = "0x0000000000000000000000000000000000003Ca6";

// remake merkleTree to get the proof
let root;
let tree;
const leaves = addresses.whitelist.map((x) => keccak256(x));
tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
root = tree.getHexRoot();

describe("Airdrop", function () {
  // declar the contracts
  let airdrop;
  let ming;
  // declar the merkleProof and the connectedContract and user address for each call
  let proof;
  let contractConnected;
  let user_address;


  beforeEach(async function () {
    // get the factory to deploy contract
    const MING = await hre.ethers.getContractFactory("MING");
    const Airdrop = await hre.ethers.getContractFactory("Airdrop");

    // deploy the contract
    ming = await MING.deploy(root, "MING", "MING");
    airdrop = await Airdrop.deploy(ming.address);
  });

  it("Should set the right implementation", async function () {
    console.log("MING has deployed at: ", ming.address);
    console.log("Airdrop has deployed at: ", airdrop.address);
    expect(await airdrop.implementation()).to.equal(ming.address);
  });

  it("The MerkleTree root hash should be the same ", async function () {
    expect(await ming.root()).to.equal(root);
  });

  it("Whitelisted user will calim 10000 ether and emit the Claim event", async function () {
    let random_whitelist = [];
    let random;
    
    // Find 100 random addresses to test the claim
    for (let i = 0; i < 100; i++) {
      random = Math.floor(Math.random() * 1000000);
      random_whitelist[i] = random;
      for (let j = 0; j < i; j++) {
        if (random_whitelist[i] == random_whitelist[j]) {
          i--;
          break;
        }
      }
    }

    for (let i of random_whitelist) {
      user_address = addresses.whitelist[i];
      contractConnected = await createContractConnect(airdrop, user_address);
      proof = await getProof(tree, user_address);
      await expect(contractConnected.claim(proof)).to.emit(ming, "Claim");
      expect(await ming.balanceOf(user_address)).to.equal(
        ethers.utils.parseEther("10000")
      );
    }
  });

  it("Can't cliam for non-whitelisted users", async function () {
    //  common_user means the non-whitelisted user
    contractConnected = await createContractConnect(
      airdrop,
      nonWhitelistedAddress
    );
    proof = tree.getHexProof(keccak256(nonWhitelistedAddress));
    await expect(contractConnected.claim(proof)).to.be.revertedWith(
      "Not WiteListed"
    );
    expect(await ming.balanceOf(nonWhitelistedAddress)).to.equal(
      ethers.utils.parseEther("0")
    );
  });

  it("Cannot be claimed twice", async function () {
    contractConnected = await createContractConnect(
      airdrop,
      whiteListedUserAddress
    );
    const proof = tree.getHexProof(keccak256(whiteListedUserAddress));
    await contractConnected.claim(proof);
    await expect(contractConnected.claim(proof)).to.revertedWith(
      "Already claimed"
    );
  });

  it("When the supply reaches the upper limit, it should be revert", async function () {

    for (let i = 0; i < 100; i++) {
      user_address = addresses.whitelist[i];
      contractConnected = await createContractConnect(airdrop, user_address);
      proof = await getProof(tree, user_address);
      await expect(contractConnected.claim(proof)).to.emit(ming, "Claim");
      expect(await ming.balanceOf(user_address)).to.equal(
        ethers.utils.parseEther("10000")
      );
    }
    user_address = addresses.whitelist[109];
    contractConnected = await createContractConnect(airdrop, user_address);
    proof = await getProof(tree, user_address);
    await expect(contractConnected.claim(proof)).to.revertedWith(
      "Exceeds maximum supply"
    );
  });
});
