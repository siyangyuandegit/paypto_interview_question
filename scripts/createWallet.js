import ethers from "ethers";
import fs from "fs"


// 生成随机助记词
const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(32));
const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

// 通过HD钱包派生100万个地址
const numWallet = 1000000;
let basePath = ethers.utils.defaultPath;
var addresses = {whitelist:[]};

for (let i = 0; i < numWallet; i++) {
  let hdNodeNew = hdNode.derivePath(basePath + "/" + i);
  let walletNew = new ethers.Wallet(hdNodeNew.privateKey);
  addresses.whitelist.push(walletNew.address);
}

console.log("success gen!")
fs.writeFile("addresses.json", JSON.stringify(addresses), (err) => {});